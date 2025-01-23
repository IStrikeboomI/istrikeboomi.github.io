#include "PlayerData.h"

struct PlayerValue{
	PlayerData data;
	double value = 0;
	bool operator>(const PlayerValue& p) const {
		if (this->value == p.value) {
			return this->data > p.data;
		}
		return this->value > p.value;
	}
};
