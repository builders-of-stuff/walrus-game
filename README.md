# Walrus game

A little game about walruses, fish, and penguins.

Click walrus to catch fish, buy penguins with fish, penguins catch fish automatically, buy more penguins.

Sites are hosted using Walrus as a decentralized store. Each minted walrus NFT comes with its own unique site thanks to Walrus redirects.

Available on Sui testnet at https://27cq3tlycwm5nihei6oxv6pbo2c1z5dpv6y67e7ux6swvwgra8.walrus.site/

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
