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

var gitRepoDir = '';

function init() {
    var configFile = './app/configs/repos.json';
    try {
	var config = JSON.parse(fs.readFileSync(configFile, {encode: 'utf-8'}));
	if (!fs.existsSync(config.basePath)) {
            throw 'config base path does not exists';
	    return;
	}
	gitRepoDir = config.basePath;
    } catch (e) {
	 console.error('config file could not be read: ' + e);
    }
}

app.get('/', function(req, res) {
    var IndexController = require('./app/controller/IndexController.js');
    var indexController = new IndexController();
    indexController.indexAction(req, res);
});

app.use(express.static(__dirname + '/app/public'));

app.get('/:reponame', function(req, res) {
    var FolderController = require('./app/controller/FolderController.js');
    var folderController = new FolderController();
    folderController.indexAction(req, res);
});

app.get('/:reponame/:branch', function(req, res) {
    var FolderController = require('./app/controller/FolderController.js');
    var folderController = new FolderController();
    folderController.branchAction(req, res);
});

app.get('/:reponame/tree/:branch/:dir', function(req, res) {
    init();

    var reponame = req.params.reponame;
    var branch = req.params.branch;
    var dir = unescape(req.params.dir);

    GitRepo.setCurrentReponame(reponame);
    GitRepo.init();
    var branches = GitRepo.getBranches();
    GitRepo.setCurrentBranch(branch);

    var renderIt = function(data) {
        res.render(
	    'folderView',
	    {
		title: reponame,
		reponame: reponame,
		heads: branches.heads,
		tags: branches.tags,
		branch: branch,
		directoryContents: data.folder,
		breadcrumb: data.breadcrumb,
		activeTab: 'Files'
	    }
	);
    };
    gitdata.getFolder(gitRepoDir + '/' + reponame, branch, dir, renderIt);
});

app.get('/:reponame/blob/:branch/:file', function(req, res) {
    init();

    var reponame = req.params.reponame;
    var branch = req.params.branch;
    var file = unescape(req.params.file);

    var GitFile = require('./app/modules/GitFile.js');
    var gitFile = new GitFile();

    GitRepo.setCurrentReponame(reponame);
    GitRepo.init();
    var branches = GitRepo.getBranches();
    GitRepo.setCurrentBranch(branch);

    var renderIt = function(data) {
	res.render(
	    'fileView',
	    {
		title: reponame,
		reponame: reponame,
		heads: branches.heads,
		tags: branches.tags,
		branch: branch,
		fileContent: data.content,
		breadcrumb: data.breadcrumb,
		activeTab: 'Files'
	    }
	);
    };

    gitFile.getFile(gitRepoDir + '/' + reponame, branch, file, renderIt);
});

function showCommits(req, res, page) {
    init();
    
    var reponame = req.params.reponame;
    var branch = req.params.branch;

    var GitLog = require('./app/modules/GitLog.js');
    var gitLog = new GitLog();

    GitRepo.setCurrentReponame(reponame);
    GitRepo.init();
    var branches = GitRepo.getBranches();
    GitRepo.setCurrentBranch(branch);

    var renderIt = function(data) {
        res.render(
            'logView',
	    {
	        title: reponame,
	        reponame: reponame,
                heads: branches.heads,
		tags: branches.tags,
		branch: branch,
                breadcrumb: data.breadcrumb,
		commits: data.commits,
		activeTab: 'Commits',
		commitCount: data.commitCount,
		page: page
	    }
        );
    };

    gitLog.getLog(gitRepoDir + '/' + reponame, branch, page, renderIt);
}

app.get('/:reponame/commits/:branch', function(req, res) {
    showCommits(req, res, 0);
});

app.get('/:reponame/commits/:branch/:page', function(req, res) {
    var page = req.params.page;
    showCommits(req, res, page);
});

app.get('/:reponame/commit/:treeish', function(req, res) {
    init();
    var reponame = req.params.reponame;
    var treeish = req.params.treeish;

    GitRepo.setCurrentReponame(reponame);
    GitRepo.init();
    var branches = GitRepo.getBranches();
    var branch = GitRepo.getCurrentBranch();

    var GitFile = require('./app/modules/GitFile.js');
    var gitFile = new GitFile();

    var renderIt = function(data) {
        res.render(
	    'fileView',
	    {
		title: reponame,
		reponame: reponame,
		heads: branches.heads,
		tags: branches.tags,
		breadcrumb: data.breadcrumb,
		activeTab: 'Commits',
		fileContent: data.content,
		branch: branch
            }
	);
    };

    gitFile.getDiff(gitRepoDir + '/' + reponame, treeish, renderIt);
});

app.listen(8080);
console.log('listen to port 8080');

