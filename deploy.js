require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'information',
        description: 'Gives info about the bot!'
    },
    {
        name: 'setup-info',
        description: 'Gives setup info.'
    },
    {
        name: 'link',
        description: 'Link a spreadsheet to the bot.',
        options: [{
            name: 'idnumber',
            description: 'Put your spreadsheet ID here.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name:'conlang',
            description: 'What is your conlang sheet named?',
            type: ApplicationCommandOptionType.String,
            required: true,
        }]
    },
    {
        name: 'delete',
        description: 'Deletes a selected conlang.',
    },
    {
        name: 'view',
        description: 'Lists the conlangs a user has linked.',
    },
    {
        name: 'troubleshoot',
        description: 'Gives a few troubleshooting suggestions as well as the support server link.',
    },
    {
        name: 'translate',
        description: 'Translate a word from one of your linked conlangs.',
        options: [{
            name: 'conlang',
            description: 'Conlang to translate to?',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {  
            name: 'input',
            description: 'Word to translate?',
            type: ApplicationCommandOptionType.String,
            required: true,
        }]
    }
];


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering commands...')
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        )
        console.log('Commands registered!')
    } catch (error) {
        console.log(error);
    }
})();