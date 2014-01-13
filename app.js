var express = require('express');
var app = express();
var fs = require('fs');
var gitrepo = require('./app/modules/GitRepo.js');
var GitRepo = new gitrepo();
var GitData = require('./app/modules/GitData.js');
var gitdata = new GitData();
var Promise = require('bluebird');

app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');

var gitRepoDir = 'C:/repo_git';

app.get('/', function(req, res) {
    var repositories = {};
    var dir = 'C:/repo_git';
    var folderInDir = fs.readdirSync(dir);
    
    folderInDir.forEach(function(currentDir) {
        var stats = fs.statSync(dir + '/' + currentDir);

	if (stats && stats.isDirectory()) {
            var descr = fs.readFileSync(dir + '/' + currentDir + '/description');
	    repositories[currentDir] = descr;
	}
    });
    var testing = function(data) {
	console.log(data);
    };
    var test = gitdata.test(gitRepoDir + '/gitlist-js.git', 'dev', testing);
    res.render(
        'index',
	{
	    title: 'repository list',
	    repos: repositories
	}
    );
});
app.use(express.static(__dirname + '/app/public'));

app.get('/:reponame', function(req, res) {
    var reponame = req.params.reponame;

    if (!fs.existsSync(gitRepoDir + '/' + reponame)) {
	res.send(404, 'File/Dir not exists');
	return;
    }

    GitRepo.setBasePath(gitRepoDir);
    GitRepo.setCurrentReponame(reponame);
    GitRepo.init();
    var branches = GitRepo.getBranches();
    var branch = GitRepo.getCurrentBranch();
var renderIt = function(data) {
    res.render(
        'folderView',
	{
	    title: reponame,
	    reponame: reponame,
	    heads: branches.heads,
	    tags: branches.tags,
	    branch: branch,
	    directoryContents: data
	}
    );
};
gitdata.test(gitRepoDir + '/' + reponame, branch, renderIt);
});

app.get('/:reponame/:branch', function(req, res) {
    var reponame = req.params.reponame;
    var branch = req.params.branch;

    GitRepo.setBasePath(gitRepoDir);
    GitRepo.setCurrentReponame(reponame);
    GitRepo.init();
    var branches = GitRepo.getBranches();
    GitRepo.setCurrentBranch(branch);
//GitRepo.getDirectoryContents();
var renderIt = function(data) {    res.render(
        'folderView',
	{
	    title: reponame,
	    reponame: reponame,
	    heads: branches.heads,
	    tags: branches.tags,
	    branch: branch,
    	    directoryContents: data
	}
    );
};
gitdata.test(gitRepoDir + '/' + reponame, branch, renderIt);
});

app.get('/:reponame/commits/:branch', function(req, res) {
    res.render(
        'index',
	{
	    title: 'blub',
	    repositories: []
	}
    );
});


app.listen(8080);
console.log('listen to port 8080');

