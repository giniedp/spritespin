deploy:
	rsync -avz --copy-links --delete dist/ devil1@giniebox:~/apps/spritespin-beta

.PONY: deploy
