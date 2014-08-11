'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var gh = require('github');
var Q = require('q');
var sys = require('sys');
var exec = require('child_process').exec;

var magenta = chalk.magenta;
var cyan = chalk.cyan;

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
    console.log(cyan('Create folder structure in:   ') + magenta(this.workspace));
    this.destinationRoot(this.workspace + this.Project);
  },

  install: function () {
    console.log(cyan('Install django base structure...'));
    exec('git clone ');
  }

});


module.exports = GeneratorDjango;
