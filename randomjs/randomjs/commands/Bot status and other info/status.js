client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: 'Tiktok', type: 3 }], // type 3 = WATCHING
    status: 'idle', // Options: 'online', 'idle', 'dnd', 'invisible'
  });
});

// 
//PLAYING	0	Playing Minecraft
//STREAMING	1	Streaming on Twitch
//LISTENING	2	Listening to Lo-fi
//WATCHING	3	Watching over the server
//CUSTOM	4	Chilling 😎
//COMPETING	5	Competing in a tournament