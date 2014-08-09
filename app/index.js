'use strict';
var yeoman = require('yeoman-generator');
var gh = require('github');
var Q = require('q');

var GeneratorDjango = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
    console.log(this.yeoman);
    this.availableModules = [];
  },

  getAvailableRepos: function () {

    this.filterList = function (json) {
      return json.language === 'Python';
    };

    this.onLoadReposiroies = function (err, res) {
        var filteredModules = res.filter(this.filterList);
        for (var x = 0, l = filteredModules.length; x < l; x++) {
            this.availableModules.push({name: filteredModules[x].name, ssh_url: filteredModules[x].ssh_url});    
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
        message: 'Path to project: (ex: /Home/foo/workspace/)'
      },
      {
        type: 'checkbox',
        name: 'modules',
        message: 'Choose with module you want to your application:',
        choices: this.availableModules
      }
    ];

    this.onQuestionHasAnswered = function (asnwer) {
      console.log(asnwer);
      done();
    };

    this.prompt(prompts, this.onQuestionHasAnswered.bind(this));
  },

});


module.exports = GeneratorDjango;
