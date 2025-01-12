#pragma once
#include <string>
#include <set>
#include <vector>
#include "Choice.h"
struct Attempt {
	short totalTd = 0;
	std::set<Choice, std::greater<Choice>> qbChoices;
	std::set<Choice, std::greater<Choice>> rbChoices;
	std::set<Choice, std::greater<Choice>> wrChoices;
	std::set<Choice, std::greater<Choice>> teChoices;

	Attempt() : qbChoices(), rbChoices(), wrChoices(), teChoices() {

	}
	void add(const PlayerData& d, const std::string_view& team) {
		Choice c(d,team);
		if (d.pos == "QB") {
			qbChoices.emplace(c);
		}
		if (d.pos == "RB") {
			rbChoices.emplace(c);
		}
		if (d.pos == "WR") {
			wrChoices.emplace(c);
		}
		if (d.pos == "TE") {
			teChoices.emplace(c);
		}
		totalTd += d.td;
	}
	inline std::set<Choice, std::greater<Choice>>& posSet(const std::string_view& pos) {
		if (pos == "QB") {
			return qbChoices;
		}
		if (pos == "RB") {
			return rbChoices;
		}
		if (pos == "WR") {
			return wrChoices;
		}
		if (pos == "TE") {
			return teChoices;
		}
	}
	int posAlreadyDone(const std::string& pos) const {
		if (pos == "QB") {
			return qbChoices.size();
		}
		if (pos == "RB") {
			return rbChoices.size();
		}
		if (pos == "WR") {
			return wrChoices.size();
		}
		if (pos == "TE") {
			return teChoices.size();
		}
		return 0;
	}
};
