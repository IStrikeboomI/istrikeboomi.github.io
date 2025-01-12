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

std::map<std::string, int> playerFrequencyMap;
std::map<std::string, int> teamFrequencyMap;

constexpr std::array<std::string_view, 4> positions = {"QB","RB","WR","TE"};
int goodAttempts = 0;
int totalTeams = 0;
int main() {
	
	for (const auto& entry : std::filesystem::directory_iterator("attempts/good")) {
		std::ifstream file(entry.path());
		json data = json::parse(file);
		for (std::string_view s : positions) {
			for (json player : data[s]) {
				playerFrequencyMap[player["name"]]++;
				teamFrequencyMap[player["team"]]++;
				totalTeams++;
			}
		}
		goodAttempts++;
	}
	std::vector<std::pair<std::string, int>> playerFrequency;
	std::copy(playerFrequencyMap.begin(),
			  playerFrequencyMap.end(),
		 std::back_inserter<std::vector<std::pair<std::string, int>>>(playerFrequency));
	std::sort(playerFrequency.begin(), playerFrequency.end(), [=](std::pair<std::string, int>& a, std::pair<std::string, int>& b) {
		return a.second > b.second;
	});
	std::filesystem::create_directories("analysis/");
	std::ofstream playerFrequencyFile("analysis/playerFrequency.txt");
	for (auto [key, value] : playerFrequency) {
		playerFrequencyFile << key << ": " << value << " - " << (100.0 * value / goodAttempts) << "%" << "\n";
	}
	playerFrequencyFile.flush();
	playerFrequencyFile.close();


	std::vector<std::pair<std::string, int>> teamFrequency;
	std::copy(teamFrequencyMap.begin(),
			  teamFrequencyMap.end(),
			  std::back_inserter<std::vector<std::pair<std::string, int>>>(teamFrequency));
	std::sort(teamFrequency.begin(), teamFrequency.end(), [=](std::pair<std::string, int>& a, std::pair<std::string, int>& b) {
		return a.second > b.second;
	});

	std::ofstream teamFrequencyFile("analysis/teamFrequency.txt");
	for (auto [key, value] : teamFrequency) {
		teamFrequencyFile << key << ": " << value << " - " << (100.0 * value / totalTeams) << "%" << "\n";
	}
	teamFrequencyFile.flush();
	teamFrequencyFile.close();

	//Read TDs from log file
	//std::ifstream logFile("log.txt");
	//std::string line;
	//std::vector<short> TDs;
	//while (std::getline(logFile, line)) {
	//	if (line.contains("with")) {
	//		std::string td = line.substr(line.find("with") + 5);
	//		td = td.substr(0, td.find("TDs") - 1);
	//		TDs.push_back(std::stoi(td));
	//	}
	//}
	return 0;
}