function test_task2(player) {
	CONF_DRONE_CARD = false; CONF_DRONE_BOT = false; 
	var engine = new DeathCubeEngine(CONT_MODE, LAYOUT16B);
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
}
