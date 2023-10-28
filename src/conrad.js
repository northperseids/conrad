require('dotenv').config();
const {
    getAuthToken,
    getSpreadSheetValues
} = require('./googleSheetsService.js');
const fs = require('fs');
const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
})

client.on('ready', (c) => {
    client.user.setActivity(`/translate in ${client.guilds.cache.size} servers`);
    console.log(`${c.user.tag} is ready!`)
});

// let user enter a spreadsheet ID
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'link') {

        // get spreadsheet ID and name from slash command input
        let newssnum = interaction.options.get('idnumber').value;
        let userid = interaction.member.id;
        let sheetName = interaction.options.get('conlang').value;
        let addToFile = { "DISCORDID": userid, "SHEET": newssnum, "CONLANG": sheetName }

        fs.readFile('./src/spreadsheets.json', "utf-8", function (err, data) {
            var readdata = JSON.parse(data)

            // check if user has already linked sheet
            if (readdata.some(itemID => itemID.SHEET === newssnum) && readdata.some(user => user.DISCORDID === userid) && readdata.some(conlang => conlang.CONLANG === sheetName)) {
                const embed = new EmbedBuilder()
                    .setColor("#FFFFFF")
                    .setDescription(`You've already linked this sheet.`)
                interaction.reply({ embeds: [embed], ephemeral: true })
            }
            // otherwise, add sheet to array
            else {

                // get sheet IDs
                let sheets = require('./spreadsheets.json');

                // find sheets user has linked
                let sheetlookup = sheets.filter(findID => findID.DISCORDID === userid);

                // if user has linked a sheet, refuse adding any more
                if (sheetlookup.length >= 3) {
                    const embed = new EmbedBuilder()
                        .setColor("#FFFFFF")
                        .setDescription(`You have already linked three sheets. To delete one, type in /delete.`)
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }
                else {
                    const dummy = readdata.push(addToFile)
                    var newFile = JSON.stringify(readdata)
                    fs.writeFile("./src/spreadsheets.json", newFile, function (err) {
                        if (err) throw err;
                        console.log('Data appended')
                    })
                    const embed = new EmbedBuilder()
                        .setColor("#FFFFFF")
                        .setDescription(`Spreadsheet linked!\n To translate, type in /translate.`)
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }
            }
        })
    }

    // allow users to delete linked sheets
    if (interaction.commandName === 'delete') {

        // get sheet IDs with readFile
        fs.readFile('./src/spreadsheets.json', "utf-8", async function (err, data) {

            // parse sheets
            var sheets = JSON.parse(data)

            // declare variables for scope
            var var1 = null;
            var var2 = null;
            var var3 = null;

            // get user's ID
            let userid = interaction.member.id;

            // find sheets user has linked
            let sheetlookup = sheets.filter(findID => findID.DISCORDID === userid);

            // let user see linked sheets
            // turn into separate
            let arr1 = sheetlookup[0];
            let arr2 = sheetlookup[1];
            let arr3 = sheetlookup[2];

            // extract spreadsheet names
            if (typeof arr1 !== 'undefined') {
                var var1 = Object.values(arr1)[2]
            }
            if (typeof arr1 === 'undefined') {
                var var1 = ' ';
            }
            if (typeof arr2 !== 'undefined') {
                var var2 = Object.values(arr2)[2]
            }
            if (typeof arr2 === 'undefined') {
                var var2 = ' ';
            }
            if (typeof arr3 !== 'undefined') {
                var var3 = Object.values(arr3)[2]
            }
            if (typeof arr3 === 'undefined') {
                var var3 = ' ';
            }

            //put linked sheets in embed
            const viewsheets = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setDescription(`Here are your linked conlangs:\n
                            **First:** ${var1}\n
                            **Second:** ${var2}\n
                            **Third:** ${var3}\n
                            **Choose one to delete, or click Dismiss to cancel.**`)

            //also make embeds for delete responses
            const deleted1 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setDescription(`Conlang ${var1} deleted.`)

            const deleted2 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setDescription(`Conlang ${var2} deleted.`)

            const deleted3 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setDescription(`Conlang ${var3} deleted.`)

            const first = new ButtonBuilder()
                .setCustomId('first')
                .setLabel('First')
                .setStyle(ButtonStyle.Primary)

            const second = new ButtonBuilder()
                .setCustomId('second')
                .setLabel('Second')
                .setStyle(ButtonStyle.Primary)

            const third = new ButtonBuilder()
                .setCustomId('third')
                .setLabel('Third')
                .setStyle(ButtonStyle.Primary)

            const firstdisabled = new ButtonBuilder()
                .setCustomId('first')
                .setLabel('First')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)

            const seconddisabled = new ButtonBuilder()
                .setCustomId('second')
                .setLabel('Second')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)

            const thirddisabled = new ButtonBuilder()
                .setCustomId('third')
                .setLabel('Third')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)

            const buttons = new ActionRowBuilder()
                .addComponents(first, second, third)

            const disabledbuttons = new ActionRowBuilder()
                .addComponents(firstdisabled, seconddisabled, thirddisabled)

            // interaction response
            const response = await interaction.reply({
                embeds: [viewsheets],
                components: [buttons],
                ephemeral: true
            })

            const collector = response.createMessageComponentCollector({ time: 300000 })

            collector.on('collect', async listen => {

                if (listen.customId === 'first') {

                    let filtered = sheets.filter(function (name) {
                        return name.CONLANG != var1
                    });

                    var newFile = JSON.stringify(filtered)
                    fs.writeFile("./src/spreadsheets.json", newFile, function (err) {
                        if (err) throw err;
                        console.log('Data deleted')
                    })

                    await listen.deferUpdate();
                    await listen.editReply({ embeds: [deleted1], components: [disabledbuttons], ephemeral: true })
                }
                if (listen.customId === 'second') {

                    let filtered = sheets.filter(function (name) {
                        return name.CONLANG != var2
                    });

                    var newFile = JSON.stringify(filtered)
                    fs.writeFile("./src/spreadsheets.json", newFile, function (err) {
                        if (err) throw err;
                        console.log('Data deleted')
                    })

                    await listen.deferUpdate();
                    await listen.editReply({ embeds: [deleted2], components: [disabledbuttons], ephemeral: true })
                }
                if (listen.customId === 'third') {

                    let filtered = sheets.filter(function (name) {
                        return name.CONLANG != var3
                    });

                    var newFile = JSON.stringify(filtered)
                    fs.writeFile("./src/spreadsheets.json", newFile, function (err) {
                        if (err) throw err;
                        console.log('Data deleted')
                    })

                    await listen.deferUpdate();
                    await listen.editReply({ embeds: [deleted3], components: [disabledbuttons], ephemeral: true })
                }
            })
        })
    }


    if (interaction.commandName === 'view') {
        // declare variables for scope
        var var1 = null;
        var var2 = null;
        var var3 = null;

        // get user's ID
        let userid = interaction.member.id;

        // get sheet IDs
        fs.readFile('./src/spreadsheets.json', "utf-8", function (err, data) {
            var sheets = JSON.parse(data)

            // find sheets user has linked
            let sheetlookup = sheets.filter(findID => findID.DISCORDID === userid);

            // turn into separate arrays
            let arr1 = sheetlookup[0];
            let arr2 = sheetlookup[1];
            let arr3 = sheetlookup[2];

            // extract spreadsheet IDs
            if (arr1) {
                var var1 = Object.values(arr1)[2]
            }
            if (arr2) {
                var var2 = Object.values(arr2)[2]
            }
            if (arr3) {
                var var3 = Object.values(arr3)[2]
            }

            const embed1 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setDescription(`Here are your linked conlangs:\n
                            ${var1}\n`)

            const embed2 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setDescription(`Here are your linked conlangs:\n
                            ${var1}\n
                            ${var2}\n`)

            const embed3 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setDescription(`Here are your linked conlangs:\n
                            ${var1}\n
                            ${var2}\n
                            ${var3}`)

            const none = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setDescription(`No conlangs found. Type in /link to add a conlang.`)

            //if only one sheet linked, send single sheet
            if (typeof var1 !== 'undefined' && typeof var2 === 'undefined' && typeof var3 === 'undefined') {
                interaction.reply({ embeds: [embed1], ephemeral: true })
            }
            //if two sheets linked, send two sheets
            if (typeof var1 !== 'undefined' && typeof var2 !== 'undefined' && typeof var3 === 'undefined') {
                interaction.reply({ embeds: [embed2], ephemeral: true })
            }
            //if three sheets linked, send three sheets
            if (typeof var1 !== 'undefined' && typeof var2 !== 'undefined' && typeof var3 !== 'undefined') {
                interaction.reply({ embeds: [embed3], ephemeral: true })
            }
            if (typeof var1 === 'undefined' && typeof var2 === 'undefined' && typeof var3 === 'undefined') {
                interaction.reply({ embeds: [none], ephemeral: true })
            }
        })
    }




    if (interaction.commandName === 'translate') {

        fs.readFile('./src/spreadsheets.json', "utf-8", function (err, data) {
            var sheets = JSON.parse(data)

            // declare variables for scope
            var var1 = null;
            var var2 = null;
            var var3 = null;
            var array1 = null;
            var array2 = null;
            var array3 = null;
            var sheet1 = null;
            var sheet2 = null;
            var sheet3 = null;

            // get user's ID
            let userid = interaction.member.id;

            // get user input
            input = interaction.options.get('input').value;
            inputcase = input.toLowerCase();

            // get conlang input
            let sheetName = interaction.options.get('conlang').value;

            // find sheets user has linked
            let sheetlookup = sheets.filter(findID => findID.DISCORDID === userid);

            // turn into separate arrays
            let arr1 = sheetlookup[0];
            let arr2 = sheetlookup[1];
            let arr3 = sheetlookup[2];

            // get conlang sheet names
            //first turn into separate arrays, then identify last array item (which is sheet name/conlang name)
            if (arr1 != null) {
                var array1 = Object.values(arr1);
                var sheet1 = array1[2];
            }
            if (arr2 != null) {
                var array2 = Object.values(arr2);
                var sheet2 = array2[2];
            }
            if (arr3 != null) {
                var array3 = Object.values(arr3);
                var sheet3 = array3[2];
            }

            // extract spreadsheet IDs
            if (arr1) {
                var var1 = Object.values(arr1)[1]
            }
            if (arr2) {
                var var2 = Object.values(arr2)[1]
            }
            if (arr3) {
                var var3 = Object.values(arr3)[1]
            }

            // if linked spreadsheet, get vals
            if (sheetName === sheet1) {
                let spreadsheetId = var1;
                async function testGetSpreadSheetValues() {
                    try {
                        const auth = await getAuthToken();
                        const response = await getSpreadSheetValues({
                            spreadsheetId,
                            sheetName,
                            auth
                        })

                        // manipulate to lookup
                        let words = JSON.stringify(response.data);
                        let wordsjson = JSON.parse(words);
                        let arr = wordsjson.values;

                        // lookup
                        let lookup = arr.filter(word => word[0] === inputcase)

                        // manipulate array
                        let definition = lookup[0];

                        //if valid, send reply              
                        if (typeof definition !== 'undefined') {

                            // separate into pieces
                            //first english word
                            let english = definition[0];

                            //then part of speech with "undefined" handling
                            var pos = definition[1]
                            if (typeof pos == 'undefined') {
                                var pos = ' '
                            }

                            //then translation (no undefined handling required, see "else" block)
                            let translation = definition[2];

                            //then pronunciation with "undefined" handling
                            var pronunciation = definition[3]
                            if (typeof pronunciation == 'undefined') {
                                var pronunciation = ' '
                            }

                            // reply with lookup text
                            const embed = new EmbedBuilder()
                                .setColor("#FFFFFF")
                                .setDescription(`*Translating to: ${sheet1}*\n
                                                    **English:** ${english}\n
                                                    **Part of Speech:** ${pos}\n
                                                    **Conlang:** ${translation}\n
                                                    **Pronunciation:** ${pronunciation}`)

                            interaction.reply({ embeds: [embed] });
                        }
                        //error handling
                        if (typeof definition == 'undefined') {
                            // reply with lookup text
                            const embed = new EmbedBuilder()
                                .setColor("#FFFFFF")
                                .setDescription(`Not found. Is ${inputcase} in your dictionary?`)

                            interaction.reply({ embeds: [embed] });
                        }

                    } catch (error) {
                        console.log(error.message, error.stack);
                    }
                }

                function main() {
                    testGetSpreadSheetValues();
                }

                main();
            }

            if (sheetName === sheet2) {
                let spreadsheetId = var2;
                let sheetName = interaction.options.get('conlang').value;
                input = interaction.options.get('input').value;
                async function testGetSpreadSheetValues() {
                    try {
                        const auth = await getAuthToken();
                        const response = await getSpreadSheetValues({
                            spreadsheetId,
                            sheetName,
                            auth
                        })

                        // manipulate to lookup
                        let words = JSON.stringify(response.data);
                        let wordsjson = JSON.parse(words);
                        let arr = wordsjson.values;

                        // lookup
                        let lookup = arr.filter(word => word[0] === inputcase)

                        // manipulate array
                        let definition = lookup[0];

                        if (typeof definition !== 'undefined') {

                            // separate into pieces
                            //first english word
                            let english = definition[0];

                            //then part of speech with "undefined" handling
                            var pos = definition[1]
                            if (typeof pos == 'undefined') {
                                var pos = ' '
                            }

                            //then translation (no undefined handling required, see "else" block)
                            let translation = definition[2];

                            //then pronunciation with "undefined" handling
                            var pronunciation = definition[3]
                            if (typeof pronunciation == 'undefined') {
                                var pronunciation = ' '
                            }

                            // reply with lookup text
                            const embed = new EmbedBuilder()
                                .setColor("#FFFFFF")
                                .setDescription(`*Translating to: ${sheet2}*\n
                                                    **English:** ${english}\n
                                                    **Part of Speech:** ${pos}\n
                                                    **Conlang:** ${translation}\n
                                                    **Pronunciation:** ${pronunciation}`)

                            interaction.reply({ embeds: [embed] });
                        }
                        else {
                            // reply with lookup text
                            const embed = new EmbedBuilder()
                                .setColor("#FFFFFF")
                                .setDescription(`Not found. Is ${inputcase} in your dictionary?`)

                            interaction.reply({ embeds: [embed] });
                        }
                    } catch (error) {
                        console.log(error.message, error.stack);
                    }
                }

                function main() {
                    testGetSpreadSheetValues();
                }

                main();
            }

            if (sheetName === sheet3) {
                let spreadsheetId = var3;
                let sheetName = interaction.options.get('conlang').value;
                input = interaction.options.get('input').value;
                async function testGetSpreadSheetValues() {
                    try {
                        const auth = await getAuthToken();
                        const response = await getSpreadSheetValues({
                            spreadsheetId,
                            sheetName,
                            auth
                        })

                        // manipulate to lookup
                        let words = JSON.stringify(response.data);
                        let wordsjson = JSON.parse(words);
                        let arr = wordsjson.values;

                        // lookup
                        let lookup = arr.filter(word => word[0] === inputcase)

                        // manipulate array
                        let definition = lookup[0];

                        if (typeof definition !== 'undefined') {

                            // separate into pieces
                            //first english word
                            let english = definition[0];

                            //then part of speech with "undefined" handling
                            var pos = definition[1]
                            if (typeof pos == 'undefined') {
                                var pos = ' '
                            }

                            //then translation (no undefined handling required, see "else" block)
                            let translation = definition[2];

                            //then pronunciation with "undefined" handling
                            var pronunciation = definition[3]
                            if (typeof pronunciation == 'undefined') {
                                var pronunciation = ' '
                            }

                            // reply with lookup text
                            const embed = new EmbedBuilder()
                                .setColor("#FFFFFF")
                                .setDescription(`*Translating to: ${sheet3}*\n
                                                **English:** ${english}\n
                                                **Part of Speech:** ${pos}\n
                                                **Conlang:** ${translation}\n
                                                **Pronunciation:** ${pronunciation}`)

                            interaction.reply({ embeds: [embed] });
                        }
                        else {
                            // reply with lookup text
                            const embed = new EmbedBuilder()
                                .setColor("#FFFFFF")
                                .setDescription(`Not found. Is ${inputcase} in your dictionary?`)

                            interaction.reply({ embeds: [embed] });
                        }
                    } catch (error) {
                        console.log(error.message, error.stack);
                    }
                }

                function main() {
                    testGetSpreadSheetValues();
                }

                main();
            }

            if (sheetName != sheet1 && sheetName != sheet2 && sheetName != sheet3) {
                const embed = new EmbedBuilder()
                    .setColor("FFFFFF")
                    .setDescription(`No conlang found by name ${sheetName}.\nType in /view to view your linked conlangs.`)

                interaction.reply({ embeds: [embed] });
            }

            else {
                return;
            }
        })
    }

    if (interaction.commandName === 'information') {
        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle('Hello! My name is Conrad.')
            .setDescription(
                `I'm a Discord bot that can link to Google Sheets to use as a dictionary database. I'm pretty small right now, and my author is new to programming, so please be patient!\n
            I'm made for conlangers (people who make languages).\n
            To get started, type /setup-info`
            )
        interaction.reply({ embeds: [embed], ephemeral: true })
    }

    if (interaction.commandName === 'setup-info') {
        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle('Setup Instructions')
            .setDescription(
                `1. Make a public Google Sheet with your conlang dictionary. *Sheet MUST be public* - click the "Share" button and be sure "anyone with the link" can view.\n
                2. Format your Google Sheet. Conrad can understand sheets with four columns - English, Part of Speech, Conlang Word, and Pronunciation, *in that order.* If you don't have anything to put in a column, leave it blank. Name the sheet tab with your conlang name.\n
                3. Get your Google Sheet's ID - this is in the URL. It's a long, unbroken string of letters and numbers between two forward slashes, like this: docs.google.com/spreadsheets/d/[SPREADSHEET ID HERE]/edit#gid=0\n
                4. Type in /link and paste in your Google Sheet's ID into the "idnumber" field. The "conlang" field *MUST* be the name of the sheet tab.\n
                5. Once the sheet is linked, type in /translate and specify which conlang you want to translate to. (You can link up to three sheets!)\n
                6. To delete a linked sheet, type in /delete and choose which of your three sheets to remove. (If you want a sheet linked again, you'll have to use /link again.)
                `
            )
        interaction.reply({ embeds: [embed], ephemeral: true })
    }

    if (interaction.commandName === 'troubleshoot') {
        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle('Setup Instructions')
            .setDescription(
                `**A few troubleshooting tips:**\n
                - Delete and re-link the sheet.\n
                - *Make sure you have spelled everything correctly!* Capitalizations shouldn't matter, but if you're having trouble, make sure your capitalization is the same, just in case that's throwing the bot off.\n
                - Be sure you have your Google Sheet formatted correctly - it needs to have *four* columns, in this order: English, Part of Speech, Conlang, Pronunciation. (If you don't have data for a specific column, leave it blank - *but the column still needs to be there!*)\n
                - If you're still having trouble, join the support server here: https://discord.gg/u3zB6z4bkC and check out Conrad's support channel.
                `
            )
        interaction.reply({ embeds: [embed], ephemeral: true })
    }
})


/* // THIS CAN USE SHEET NAME VAR
async function testGetSpreadSheetValues() {
    let spreadsheetId = '1IxyaGl9l5t8ehorUSQ2clXzJeysF6WgTgS14A8tKVYY'
    let sheetName = 'conrad2'
    try {
        const auth = await getAuthToken();
        const response = await getSpreadSheetValues({
            spreadsheetId,
            sheetName,
            auth
        })

        // manipulate to get sheet name
        let words = JSON.stringify(response.data);
        let wordsjson = JSON.parse(words);
        let arr = wordsjson.range;

        // split along !
        let namedsheet = arr.split('!')[0]

    } catch (error) {
        console.log(error.message, error.stack);
    }
}

function main() {
    testGetSpreadSheetValues();
}

main(); */

client.login(process.env.TOKEN);
