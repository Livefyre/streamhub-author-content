'use strict';

var debug = require('streamhub-sdk/debug');
var inherits = require('inherits');
var Readable = require('stream/readable');
var AuthorContentClient = require('streamhub-author-content/author-content-client');
var StateToContent = require('streamhub-sdk/content/state-to-content');

var log = debug('streamhub-sdk/streams/author-archive');

var AuthorArchive = function (authorId, opts) {
    opts = opts || {};

    this._authorId = authorId;
    this._network = authorId.split('@')[1];
    this._authorContentClient = opts.authorContentClient || new AuthorContentClient();
    this._hasMoreContent = true;

    this._offset = 0;
    this._pageIndex = 0;
    this._limit = opts.limit || 50;

    Readable.call(this, opts);
};
inherits(AuthorArchive, Readable);

AuthorArchive.prototype._read = function () {
    if (! this._hasMoreContent) {
        this.push(null);
        return;
    }

    var authorContentClientOpts = {
        authorId: this._authorId,
        network: this._network,
        offset: this._pageIndex,
        limit: this._limit
    };

    this._authorContentClient.getAuthorContent(authorContentClientOpts, function (err, data) {
        if (err || ! data) {
            this.emit('error', new Error('Error requesting Bootstrap author data for user: '+authorContentClientOpts.authorId));
            return;
        }
        this._pageIndex++;
        this._offset += this._limit;

        var contents = this._contentsFromBootstrapDoc(data);
        if (contents.length < this._limit) {
            this._hasMoreContent = false;
            this.push.apply(this, contents);
            return;
        }

        this.push.apply(this, contents);
    }.bind(this));
};

AuthorArchive.prototype._contentsFromBootstrapDoc = function (bootstrapDoc, opts) {
    opts = opts || {};
    bootstrapDoc = bootstrapDoc || {};

    var contents = [];
    var content;
    var states = bootstrapDoc.data.content || [];
    var state;

    var stateToContent = this._createStateToContent({
        authors: bootstrapDoc.data.authors,
        replies: true
    });
    stateToContent.on('data', function (content) {
        contents.push(content);
    });

    for (var i=0, statesCount=states.length; i < statesCount; i++) {
        state = {};
        state.content = states[i];

        // Since the state from the author content endpoint is missing
        // the `type` and `source` properties set the appropriate defaults. 
        state.type = states[i].type || StateToContent.enums.type.indexOf('CONTENT');
        state.source = states[i].source || StateToContent.enums.source.indexOf('livefyre');
        content = stateToContent.write(state);
    }
    stateToContent.write(bootstrapDoc.data);

    log("created contents from bootstrapDoc", contents);
    return contents;
};

AuthorArchive.prototype._createStateToContent = function (opts) {
    opts = opts || {};
    return new StateToContent(opts);
};

module.exports = AuthorArchive;
