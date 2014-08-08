'use strict';
var yeoman = require('yeoman-generator');
var gh = require('github');
var Q = require('q');

var GeneratorDjango = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
    this.availableModules = [];
  },

  getAvailableRepos: function () {

    var done = this.async();
    this.filterList = function (json) {
      return json.language === 'Python';
    };
    var ghAPI = new gh({
      version: '3.0.0'
    });
    Q(ghAPI.repos.getFromOrg({org: 'rcdigital'}, function (err, res) {
      this.availableModules = res.filter(this.filterList);
      this.askFor();
    }.bind(this)));
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
      }
    ];

    this.prompt(prompts, function (asnwer) {
      console.log(asnwer);
    });
  },

});


module.exports = GeneratorDjango;
