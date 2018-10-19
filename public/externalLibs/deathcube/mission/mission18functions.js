function test_task3(player, isGrader, interval) {
	CONF_MAX_INERTIA = 2;
	var engine = new DeathCubeEngine(CONT_MODE, LAYOUT18, isGrader, interval);
	engine.__registerPlayer(player);
	player.take(list(MakeAndInstallLightSaber(player.getLocation(), 30, COL_RED),
									 MakeAndInstallLaser(player.getLocation(), 30, COL_BLUE),
									 MakeAndInstallLightning(player.getLocation(), 30, COL_PURPLE)));    
	engine.__addEndGame(
		new EndGame(
			function(){
				return player.getLocation() === Room.__genRoom;
			},
			function(){
				alert("Congratulations! You have entered the generator room!");
			}
		)
	);
	engine.__start();
	return engine;
}

function test_task4(player, isGrader, interval) {
	CONF_MAX_INERTIA = 2;
	var engine = new DeathCubeEngine(CONT_MODE, LAYOUT18, isGrader, interval);
	engine.__registerPlayer(player);
	player.take(list(MakeAndInstallLightSaber(player.getLocation(), 30, COL_RED),
									 MakeAndInstallLaser(player.getLocation(), 30, COL_BLUE),
									 MakeAndInstallLightning(player.getLocation(), 30, COL_PURPLE),
									 MakeAndInstallGenBomb(player.getLocation(), 30, COL_ORANGE)));    
	engine.__addEndGame(
		new EndGame(
			function(){
				var things = Room.__genRoom.getThings();
				return is_empty_list(filter(function (thing) {return thing instanceof Generator && !thing.__isDestroyed();}, things));
			},
			function(){
				alert("Congratulations! The generator has been destroyed!");
			}
		)
	);
	engine.__start();
	return engine;
}
