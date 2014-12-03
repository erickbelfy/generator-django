'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var gh = require('github');
var Q = require('q');
var sys = require('sys');
var log = require('simple-output');
var exec = require('shelljs').exec;
var rm = require('shelljs').rm;
var cp = require('shelljs').cp;
var pwd = require('shelljs').pwd;

var magenta = chalk.magenta;
var cyan = chalk.cyan;
var red = chalk.red;
var green = chalk.green;

var GeneratorDjango = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
    console.log(this.yeoman);
    this.choicesModules = [];
    this.modules = {};
    this.selectedModules = [];
    this.project = null;
    this.workspace = null;
  },

  getAvailableRepos: function () {

    this.filterList = function (json) {
      return json.language === 'Python';
    };

    this.onLoadReposiroies = function (err, res) {
        var filteredModules = res.filter(this.filterList);
        for (var x = 0, l = filteredModules.length; x < l; x++) {
          this.choicesModules.push({name: filteredModules[x].name, ssh_url: filteredModules[x].ssh_url});
          this.modules[filteredModules[x].name] = {name: filteredModules[x].name, ssh_url: filteredModules[x].ssh_url};
        }
    };

    var ghAPI = new gh({
      version: '3.0.0'
    });

    Q(ghAPI.repos.getFromOrg({org: 'rcdigital'}, this.onLoadReposiroies.bind(this)));
  },

  askFor: function () {
    var done = this.async();

    var prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:'
      },
      {
        type: 'input',
        name: 'workspace',
        message: 'Workspace absolute folder: (ex: /Home/foo/workspace/)'
      },
      {
        type: 'checkbox',
        name: 'modules',
        message: 'Which modules you want to install in your application:',
        choices: this.choicesModules
      }
    ];

    this.onQuestionHasAnswered = function (answer) {
      this.project = answer.projectName;
      this.workspace = answer.workspace;
      this.selectedModules = answer.modules;
      done();
    };

    this.prompt(prompts, this.onQuestionHasAnswered.bind(this));
  },

  configure: function () {
    var done = this.async();
    console.log(cyan('Create folder structure in:') + ' --- ' + magenta(this.workspace));
    this.destinationRoot(this.workspace + this.project);

    exec('git clone git@github.com:rcdigital/django-settings.git', function (code, output) {
      log.success('Copy fabric file.');
      cp(this.destinationRoot() + '/django-settings/fabfile.py', this.destinationRoot() +  '/fabfile.py');
      log.success('Copy requirements file.');
      cp( this.destinationRoot() + '/django-settings/requirements.txt', this.destinationRoot() + '/requirements.txt');
      rm('-rf', this.destinationRoot() + '/django-settings');
      log.success('VM has installed');
      done();
    }.bind(this));

    console.log(cyan('Configuring virtual environment...'));
    exec('virtualenv --distribute env', function (code, output) {
      exec('source env/bin/activate');
      console.log(pwd());
      console.log(red('*') + ' ' + green('Installing Dependencies...'));
      exec('pip install -r  requirements.txt', function (code, output) {
        log.error(code);
        log.error(output);
        log.success('Dependencies are installed');
        done();
      }.bind(this));
    }.bind(this));

  },

  install: function () {
    console.log(cyan('Install django base structure...'));
    var done = this.async();
    var nextModule = 0;
    this.cloneRepository = function (repoUrl) {
      console.log(red('* ') + green('Cloning repository ' + repoUrl));
      exec('git clone ' + repoUrl, function (code, output) {
        log.message(output);
        nextModule++;
        if (this.selectedModules[nextModule] !== undefined) {
          this.cloneRepository.call(this, this.modules[this.selectedModules[nextModule]].ssh_url);
        }
      }.bind(this));
    };

    this.cloneRepository.call(this, this.modules[this.selectedModules[nextModule]].ssh_url);
    done();
  }

});


module.exports = GeneratorDjango;
