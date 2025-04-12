
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
let Taxes = require('probot-taxes');

require("dotenv").config();

const ora = require("ora");

const ora2 = ora("Loading ...").start();

client.on("ready", () => {
    ora2.succeed("I'm ready.");
    client.user.setPresence({status: 'idle'});
});

process.on("unhandledRejection", error => {
  return console.log(error);
});

const prefix = "$";
const amount = "10"; 
const owner = "1043175272897318982"; 
const probotID = "282859044593598464";
const choices = ["10000", "200000", "1121212"];
const logChannelID = "1142883992316690473"; 
let usr;
let usrID;
const randomGift = choices[Math.floor(Math.random() * choices.length)];
const cooldowns = new Collection();

client.on("messageCreate", async message => {
    if(message.content == prefix + "s"){
        let check = cooldowns.get(message.author.id);          
        let embed = new MessageEmbed().setColor("#ff0000").setDescription("**انت يجب ان تستكمل عملية الدفع أولا**");
        if(check == true) return message.reply({embeds: [embed]});

        if(!cooldowns.get({userID: message.author.id})){
            let tax = Taxes(amount).tax;
            const embed = new MessageEmbed()
            .setTitle(`قم بتحويل ${tax} ل ${(await client.users.fetch(owner)).tag}`)
            .setDescription(`**c ${owner} ${tax} 
  قم تحويل مبلغ ايدي اللي موجود فوق**`);
            let embed2 = new MessageEmbed()
            .setColor("#ffff00")
            .setDescription(`User ${message.author} Maybe want to pay`);
            let channelCheck = client.channels.cache.get(logChannelID);
            const logMsg = channelCheck.send({embeds: [embed2]});
            let check = cooldowns.get(message.author.id);
            cooldowns.set( message.author.id ,   true );
            usr = message.author.username;
            usrID = message.author.id;

            let msg = await message.reply({embeds: [embed]});
            const filter = response =>
            response.content.startsWith(`**:moneybag: | ${message.author.username}, has transferred `)
            && response.content.includes(`${owner}`) && response.author.id === probotID && response.content.includes(Number(amount));
            message.channel.awaitMessages({filter,max:1,time: 0}).then(async collected => { 
                let prize = randomGift;
                let embed3 = new MessageEmbed()
                .setColor("#00ff00")
                .setDescription(`${message.author} دفع و فاز بجايزة ${prize}`);

                channelCheck.send({embeds: [embed3]});
                const embed = new MessageEmbed()
                .setDescription(` قم بالضغط على زر Spin للف العجلة `)
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp();
                const btn = new MessageActionRow().addComponents(new MessageButton()
                .setCustomId("spin")
                .setLabel("Spin")
                .setStyle("SECONDARY")
                );
                message.channel.send({embeds: [embed] , components: [btn]});

                const filter = i => i.customId === 'spin' && i.user.id === message.author.id;

                const collector = message.channel.createMessageComponentCollector({ filter, time: 0, max:1 });

                collector.on('collect', async i => {
                    let embed3 = new MessageEmbed()
                    .setDescription(`** لقد فزت   : ${prize}**`);
                    await i.deferReply({ephemeral: true});
                    await i.editReply({embeds: [embed3.setDescription("جارى لف العجلة ")]});
                    setTimeout(async() => {
                    await i.editReply({ embeds: [embed3.setDescription(`لقد فزت  : ${randomGift}`)], components: [], ephemeral:true });
                    },5000);
                });
            })
        }
    }
});

client.on("messageDelete" , message => {
    if(message.content.includes(usr) && message.author.id == probotID){
        cooldowns.delete(usrID , true);
    }
});

client.login(process.env.token).catch((error) => {
    console.warn("[31m Token Invalid");
});
    