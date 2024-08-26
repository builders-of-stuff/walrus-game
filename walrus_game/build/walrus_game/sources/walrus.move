module walrus_game::walrus;

use std::string::String;
use sui::address;
use sui::display;
use sui::package;
// use sui::random::{Random, RandomGenerator}; 
// use sui::object_bag::{Self, ObjectBag};

const BASE36: vector<u8> = b"0123456789abcdefghijklmnopqrstuvwxyz";

const VISUALIZATION_SITE: address =
    @0x901fb0569e5054eea1bea1500d1fdfefa8b5cc4def4574c0c99c64b3af24a3ab;

const PENGUIN_PRICE: u64 = 10;

const PENGUIN_FISHING_POWER: u64 = 10;

const EInsufficientFish: u64 = 0;
const EFishClaimedTooEarly: u64 = 1;

public struct Walrus has key, store {
    id: UID,
    b36_address: String,
    penguins: vector<u64>,
    total_fishing_power: u64,
    fish_last_claimed_at: u64,
    fish_count: u64,
}

public struct WALRUS has drop {}

// fun init(otw: WALRUS, ctx: &mut TxContext) {
//     let publisher = package::claim(otw, ctx);
//     let mut display = display::new<Walrus>(&publisher, ctx);

//     display.add(
//         b"link".to_string(),
//         b"https://{{b36_address}}.walrus.site".to_string(),
//     );
//     display.add(
//         b"walrus site address".to_string(),
//         VISUALIZATION_SITE.to_string(),
//     );
//     display.update_version();

//     transfer::public_transfer(publisher, ctx.sender());
//     transfer::public_transfer(display, ctx.sender());
// }

entry fun mint(ctx: &mut TxContext) {
    let walrus = new(ctx);

    transfer::transfer(walrus, tx_context::sender(ctx));
}

entry fun add_penguin(walrus: &mut Walrus, ctx: &mut TxContext) {
    assert!(walrus.fish_count >= PENGUIN_PRICE, EInsufficientFish);

    walrus.fish_count = walrus.fish_count - PENGUIN_PRICE;
    walrus.penguins.push_back(1);
    walrus.total_fishing_power = walrus.total_fishing_power + PENGUIN_FISHING_POWER;
}

entry fun claim_penguin_fish(walrus: &mut Walrus, now: u64, ctx: &mut TxContext) {
    assert!(now > walrus.fish_last_claimed_at, EFishClaimedTooEarly);

    let time_difference = now - walrus.fish_last_claimed_at;
    
    // Assuming 1 fishing power catches 1 fish per minute
    let new_fish = (time_difference * walrus.total_fishing_power) / 60000; // 60000 ms in a minute
    
    walrus.fish_count = walrus.fish_count + new_fish;
    walrus.fish_last_claimed_at = now;
}

entry fun claim_fish(walrus: &mut Walrus, fish_count: u64, now: u64, ctx: &mut TxContext) {
    walrus.fish_count = walrus.fish_count + fish_count;
    walrus.fish_last_claimed_at = now;

}

fun new(ctx: &mut TxContext): Walrus {
    let id = object::new(ctx);
    let b36_address = to_b36(id.uid_to_address());
    let penguins = vector<u64>[];
    let total_fishing_power = 0;
    let fish_last_claimed_at = 0;
    let fish_count = 0;

    Walrus {
        id,
        b36_address,
        penguins,
        total_fishing_power,
        fish_last_claimed_at,
        fish_count,
    }
}

public fun to_b36(addr: address): String {
    let source = address::to_bytes(addr);
    let size = 2 * vector::length(&source);
    let b36copy = BASE36;
    let base = vector::length(&b36copy);
    let mut encoding = vector::tabulate!(size, |_| 0);
    let mut high = size - 1;

    source.length().do!(|j| {
        let mut carry = source[j] as u64;
        let mut it = size - 1;
        while (it > high || carry != 0) {
            carry = carry + 256 * (encoding[it] as u64);
            let value = (carry % base) as u8;
            *&mut encoding[it] = value;
            carry = carry / base;
            it = it - 1;
        };
        high = it;
    });

    let mut str: vector<u8> = vector[];
    let mut k = 0;
    let mut leading_zeros = true;
    while (k < vector::length(&encoding)) {
        let byte = encoding[k] as u64;
        if (byte != 0 && leading_zeros) {
            leading_zeros = false;
        };
        let char = b36copy[byte];
        if (!leading_zeros) {
            str.push_back(char);
        };
        k = k + 1;
    };
    str.to_string()
}


// public fun calculate_fish(walrus: &mut Walrus, clock: &Clock) {
//     let current_time = clock::timestamp_ms(clock);
//     let time_diff = current_time - walrus.last_claim_timestamp;
    
//     // Assuming 1 fishing power catches 1 fish per hour
//     let new_fish = (time_diff * walrus.total_fishing_power) / 3600000; // 3600000 ms in an hour
    
//     walrus.fish_count = walrus.fish_count + new_fish;
//     walrus.last_claim_timestamp = current_time;
// }

// public fun add_penguin(walrus: &mut Walrus, penguin_power: u64) {
//     vector::push_back(&mut walrus.penguins, 1);
//     walrus.total_fishing_power = walrus.total_fishing_power + penguin_power;
// }

// public fun remove_penguin(walrus: &mut Walrus, penguin_power: u64) {
//     let _ = vector::pop_back(&mut walrus.penguins);
//     walrus.total_fishing_power = walrus.total_fishing_power - penguin_power;
// }
