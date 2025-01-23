#include <iostream>
#include <string>
#include <string_view>
#include <fstream>
#include <filesystem>
#include <array>
#include <set>
#include "PlayerData.h"
#include "PlayerValue.h"
#include "Attempt.h"
#include <../lib/json.hpp>
#include <chrono>
#include <random>
#include <thread>

using json = nlohmann::json;

//list of current teams
//data.json have players with other older teams, some of which have been corrected
constexpr std::array<std::string_view, 32> TEAMS = {
	"NYJ","BUF","NWE","MIA",
	"HOU","TEN","JAX","IND",
	"CLE","CIN","BAL","PIT",
	"RAI","LAC","KAN","DEN",
	"NYG","PHI","DAL","WAS",
	"CAR","TAM","ATL","NOR",
	"MIN","DET","CHI","GNB",
	"SFO","ARI","LAR","SEA"
};

//How many threads to use
constexpr int THREADS = 5;
//The amount of attempts to try each thread
constexpr int ATTEMPTS_PER_THREAD = 20000000;

//used for getting average TDs
std::atomic<unsigned long long> allTotalTouchdowns = 0;
//used for TD count for best attempt
std::atomic<int> bestAttemptNumber;
std::atomic<int> bestAttemptTD;

constexpr std::array<std::string_view, 4> positions = {"QB","RB","WR","TE"};

//Sixth best TDs for all the positions, used for calculating each players value
constexpr std::array<int, positions.size()> sixthBestTDsForPos = {438, 133,122,74};
//sorted player data
std::array<std::set<PlayerData, std::greater<PlayerData>>, positions.size()> data;
//A set for each team (total 32 sets) that has the sorted by highest value players
std::map<std::string_view, std::set<PlayerValue, std::greater<PlayerValue>>> bestPlayersForTeams;
//file for logging, same thing that gets printed in console
std::ofstream logFile;

//generates a random integer between [0, 31], used to select team
int random32() {
	static std::random_device dev;
	static std::mt19937 rng(dev());
	static std::uniform_int_distribution<std::mt19937::result_type> distribution(0, 31);

	return distribution(rng);
}
//does attempt
Attempt doAttempt() {
	Attempt attempt;
	//run 24 times
	for (int i = 0; i < 6 * positions.size(); i++) {
		const std::string randomTeam = std::string(TEAMS[random32()]);
		//greedy algorithm that just takes player with highest td, slow and doesn't get best player
		/*
		PlayerData highestOnTeam;
		for (int i = 0; i < positions.size(); i++) {
			std::set<PlayerData, std::greater<PlayerData>> s = data[i];
			for (PlayerData d : s) {
				if (d.td > highestOnTeam.td) {
					if (d.teams.contains(randomTeam) &&
						!attempt.posSet(d.pos).contains(Choice(d, randomTeam)) &&
						attempt.posAlreadyDone(d.pos) < 6) {
						highestOnTeam = d;
					}
				} else {
					break;
				}
			}
		}
		*/
		//Also greedy algorithm but only looks at team data and gets highest value
		PlayerValue highestValueOnTeam;
		for (PlayerValue v : bestPlayersForTeams[randomTeam]) {
			//get highest value
			if (v.value > highestValueOnTeam.value) {
				//check if player is not already chosen and if there is enough space
				if (!attempt.posSet(v.data.pos).contains(Choice(v.data, randomTeam)) &&
					attempt.posAlreadyDone(v.data.pos) < 6) {
					highestValueOnTeam = v;
				}
			} else {
				//since the set is sorted by value, we don't have to go through whole set
				break;
			}
		}
		attempt.add(highestValueOnTeam.data, randomTeam);
	}
	return attempt;
}
//Does attempt and everything after, like making the file
void attemptPostProcessing(int thread) {
	for (int a = ATTEMPTS_PER_THREAD * thread; a < ATTEMPTS_PER_THREAD * (thread + 1); a++) {
		auto attemptStart = std::chrono::high_resolution_clock::now(); 
		Attempt attempt = doAttempt();
		
		//Serialize
		std::ofstream attemptFile;
		if (attempt.totalTd >= 5500) {
			attemptFile.open("attempts/good/" + std::to_string(a) + ".json");
		} else {
			//uncomment this if you want to save bad attempts
			//attemptFile.open("attempts/fail/" + std::to_string(a) + ".json");
		}
		if (attemptFile) {
			nlohmann::ordered_json attemptJSON;
			for (int i = 0; i < positions.size(); i++) {
				for (Choice c : attempt.posSet(positions[i])) {
					json choiceJSON;
					choiceJSON["team"] = c.team;
					choiceJSON["name"] = c.name;
					choiceJSON["td"] = c.td;
					attemptJSON[positions[i]].push_back(choiceJSON);
				}
			}
			attemptJSON["td"] = attempt.totalTd;

			attemptFile << std::setw(4) << attemptJSON << "\n";
			attemptFile.flush();
			attemptFile.close();
		}
		auto attemptEnd = std::chrono::high_resolution_clock::now();
		auto attemptDuration = std::chrono::duration_cast<std::chrono::microseconds>(attemptEnd - attemptStart);

		allTotalTouchdowns += attempt.totalTd;
		if (attempt.totalTd > bestAttemptTD) {
			bestAttemptTD = attempt.totalTd;
			bestAttemptNumber = a;
		}
		std::stringstream msg;
		msg << "Attempt #" << a << " done in " << attemptDuration << " on thread #" << thread << " with " << attempt.totalTd << " TDs" << "\n";
		std::cout << msg.str();
		logFile << msg.str();
	}
}
//Create Induvial position data, Only really needs to be added once, but good to do it after updating data.json, needs data.json
void createPositionData() {
	std::ifstream dataFile("data.json");
	json jsonData = json::parse(dataFile);
	dataFile.close();

	for (json d : jsonData) {
		PlayerData p;
		p.name = d["name"];
		p.td = d["td"];
		p.teams = d["teams"];
		for (int i = 0; i < positions.size(); i++) {
			if (d["pos"] == std::string(positions[i])) {
				data[i].emplace(p);
			}
		}
	}
	for (int i = 0; i < positions.size(); i++) {
		json j;
		for (PlayerData d : data[i]) {
			json playerData;
			playerData["name"] = d.name;
			playerData["teams"] = d.teams;
			playerData["td"] = d.td;
			j.push_back(playerData);
		}
		std::ofstream posFile(std::string(positions[i]) + "data.json");
		posFile << std::setw(4) << j << "\n";
		posFile.flush();
		posFile.close();
	}
}
//Creates set and files for player value
void createPlayerValueData() {
	//create set for player value
	for (std::string_view team : TEAMS) {
		bestPlayersForTeams[team] = std::set<PlayerValue, std::greater<PlayerValue>>();
	}
	//Reads position data file to create value set
	for (int i = 0; i < positions.size(); i++) {
		std::ifstream file(std::string(positions[i]) + "data.json");
		json j = json::parse(file);
		file.close();
		for (auto& [key, value] : j.items()) {
			PlayerData d;
			d.name = value["name"];
			d.td = value["td"];
			d.pos = positions[i];
			d.teams = value["teams"];
			data[i].emplace(d);
			PlayerValue v(d);
			//value is just proportion to sixth best for position, if >1 then top 6 at position
			v.value = 1.0 * d.td / sixthBestTDsForPos[i];
			for (std::string_view s : d.teams) {
				if (bestPlayersForTeams.count(s) > 0) {
					bestPlayersForTeams[s].insert(v);
				}
			}
		}
	}
	//create each team best player value
	std::filesystem::create_directories("best players");
	for (auto [key, value] : bestPlayersForTeams) {
		std::ofstream posFile("best players/" + std::string(key) + ".json");
		nlohmann::ordered_json posJSON;
		for (PlayerValue v : value) {
			json choiceJSON;
			PlayerData d = v.data;
			choiceJSON["name"] = d.name;
			choiceJSON["teams"] = d.teams;
			choiceJSON["td"] = d.td;
			choiceJSON["pos"] = d.pos;
			choiceJSON["value"] = v.value;
			posJSON.push_back(choiceJSON);
		}
		posFile << std::setw(4) << posJSON << "\n";
		posFile.flush();
		posFile.close();
	}
}

int main() {
	auto indexingStart = std::chrono::high_resolution_clock::now();
	createPositionData();
	createPlayerValueData();
	for (int i = 0; i < positions.size();i++) {
		std::cout << "Amount of " << positions[i] << "s: " << data[i].size() << "\n";
	}
	
	auto indexingStop = std::chrono::high_resolution_clock::now();
	auto indexingDuration = std::chrono::duration_cast<std::chrono::milliseconds>(indexingStop - indexingStart);
	std::cout << "Indexing done in " << indexingDuration << "\n\n";
	//create log file
	logFile.open("log.txt");
	//create directory for attempts
	std::filesystem::create_directories("attempts/fail");
	std::filesystem::create_directories("attempts/good");
	auto attemptsStart = std::chrono::high_resolution_clock::now();
	//create threads and start
	std::vector<std::thread> threads;
	for (int i = 0; i < THREADS;i++) {
		threads.push_back(std::thread(attemptPostProcessing, i));
	}
	//wait for all threads to end
	for (std::thread& t : threads){
		t.join();
	}
	auto attemptsStop = std::chrono::high_resolution_clock::now();
	auto attemptsDuration = std::chrono::duration_cast<std::chrono::seconds>(attemptsStop - attemptsStart);

	std::cout << "\n";
	std::cout << "Took " << attemptsDuration << "\n";
	std::cout << "Average TDs: " << 1.0 * allTotalTouchdowns / (ATTEMPTS_PER_THREAD * THREADS) << "\n";
	std::cout << "Best Attempt was #" << bestAttemptNumber << ", TDs: " << bestAttemptTD << "\n";

	//finish log
	logFile << "\n";
	logFile << "Attempts: " << THREADS * ATTEMPTS_PER_THREAD << "\n";
	logFile << "Took " << attemptsDuration << "\n";
	logFile << "Average TDs: " << 1.0 * allTotalTouchdowns / (ATTEMPTS_PER_THREAD * THREADS) << "\n";
	logFile << "Best Attempt was #" << bestAttemptNumber <<", TDs: " << bestAttemptTD << "\n";
	logFile.flush();
	logFile.close();
	return 0;
}
