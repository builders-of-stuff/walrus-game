# Walrus game

A little game about walruses, fish, and penguins.

Click walrus to catch fish, buy penguins with fish, penguins catch fish automatically, buy more penguins.

Sites are hosted using Walrus as a decentralized store. Each minted walrus NFT comes with its own unique site thanks to Walrus redirects.

Available on Sui testnet at [https://6611bjx7yql93gjq2fjwvfapc6ihc3j070lgrbol8ewiliw4w2.walrus.site](https://4j5tbcmxs58v45u0w927p2vzmed5zfhnbrhe29oz699h8872iy.walrus.site)

Minting site repo: https://github.com/builders-of-stuff/walrus-game-mint

Video demo: https://youtu.be/CTJWYDa5LxQ

# How to deploy

1. Update & build walrus-sites repo
2. Build this repo's static files
3. Deploy static files as walrus-site
4. Update this repo's `.move` with the new package ID
5. Deploy smart contracts
6. Update `shared.constant` & update walrus-site
7. Deploy mint site as walrus site
