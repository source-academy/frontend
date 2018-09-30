function test_task(player) {
	CONF_MAX_INERTIA = 2;
	var engine = new DeathCubeEngine(CONT_MODE, LAYOUT17);
	engine.__registerPlayer(player);
	var mySaber = MakeAndInstallLightSaber(player.getLocation(), 30, COL_RED);
	player.take(list(mySaber));    
	engine.__addEndGame(
		new EndGame(
			function(){
				return (player.getLocation() instanceof ProtectedRoom);
			},
			function(){
				alert("Congratulations! You have entered a protected room!");
			}
		)
	);
	engine.__start();
	return engine;
}
