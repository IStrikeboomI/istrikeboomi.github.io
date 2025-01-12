#pragma once
#include <string>
#include <set>
struct PlayerData {
	std::string name;
	int td = 0;
	std::string pos;
	std::set<std::string> teams;
	bool operator<(const PlayerData& p) const {
		if (this->td == p.td) {
			if (this->name == p.name) {
				return this->pos < pos;
			}
			return this->name < p.name;
		}
		return this->td < p.td;
	}
	bool operator>(const PlayerData& p) const {
		if (this->td == p.td) {
			if (this->name == p.name) {
				return this->pos > pos;
			}
			return this->name > p.name;
		}
		return this->td > p.td;
	}
};