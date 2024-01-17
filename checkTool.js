import inquirer from 'inquirer';
import chalk from 'chalk';

const questions = [
    {
        type: 'list',
        name: 'variant',
        message: 'Welche Variante möchten Sie installieren?',
        choices: ['Variante 1', 'Variante 2'],
    }
];

inquirer.prompt(questions).then(answers => {
    if (answers.variant === 'Variante 1') {
        console.log(chalk.green('Variante 1 wird installiert...'));
        // Fügen Sie hier Ihren Installationscode für Variante 1 ein
    } else {
        console.log(chalk.green('Variante 2 wird installiert...'));
        // Fügen Sie hier Ihren Installationscode für Variante 2 ein
    }
});