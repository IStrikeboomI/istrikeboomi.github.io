#pragma once
#include <string>
#include "PlayerData.h"
struct Choice {
	std::string name;
	int td;
	std::string team;
	Choice(const PlayerData& d, const std::string_view& team) : name(d.name), td(d.td), team(team) {}
	
	bool operator<(const Choice& p) const {
		if (this->name == p.name) {
			return this->td < p.td;
		}
		return this->name < p.name;
	}
	bool operator>(const Choice& p) const {
		if (this->name == p.name) {
			return this->td > p.td;
		}
		return this->name > p.name;
	}
};