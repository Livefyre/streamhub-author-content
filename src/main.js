'use strict';

var debug = require('streamhub-sdk/debug');
var inherits = require('inherits');
var Readable = require('stream/readable');
var AuthorContentClient = require('streamhub-author-content/author-content-client');
var StateToContent = require('streamhub-sdk/content/state-to-content');
var Collection = require('streamhub-sdk/collection');

var log = debug('streamhub-sdk/streams/author-archive');

var AuthorArchive = function (authorId, opts) {
    opts = opts || {};

    this._authorId = authorId;
    this._network = authorId.split('@')[1];
    this._authorContentClient = opts.authorContentClient || new AuthorContentClient();
    this._hasMoreContent = true;
    this._replies = ('replies' in opts) ? opts.replies : true;

    this._nextUntil = undefined;
    this._limit = opts.limit || 25;

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
        until: this._nextUntil,
        limit: this._limit
    };

    this._authorContentClient.getAuthorContent(authorContentClientOpts, function (err, response) {
        var data = response && response.data;
        if (err || ! data) {
            this.emit('error', new Error('Error requesting Bootstrap author data for user: '+authorContentClientOpts.authorId));
            return;
        }
        this._pageIndex++;
        this._offset += this._limit;

        var contents = this._contentsFromBootstrapDoc(data);

        this._hasMoreContent = data.meta.hasPrev;
        this._nextUntil = data.meta.prev;

        this.push.apply(this, contents);
    }.bind(this));
};

AuthorArchive.prototype._contentsFromBootstrapDoc = function (bootstrapDoc, opts) {
    opts = opts || {};
    bootstrapDoc = bootstrapDoc || {};
    var self = this;
    var contents = [];
    var states = bootstrapDoc.content || [];

    var stateToContent = this._createStateToContent({
        authors: bootstrapDoc.authors
    });

    contents = states.map(function (state) {
        // Since the state from the author content endpoint is missing
        // the `type` and `source` properties set the appropriate defaults. 
        state.type = state.type || StateToContent.enums.type.indexOf('CONTENT');
        state.source = state.source || StateToContent.enums.source.indexOf('livefyre');
        var threadContents = stateToContent.transform(state, bootstrapDoc.authors, {
            replies: self._replies,
            collection: new Collection({
                network: self._network,
                siteId: state.collection.siteId,
                articleId: state.collection.articleId,
                id: state.collection.id
            })
        });
        var content = threadContents[0];
        return content;
    }).filter(function (content) {
        // Only the truthies
        return content;
    });

    log("created contents from bootstrapDoc", contents);
    return contents;
};

AuthorArchive.prototype._createStateToContent = function (opts) {
    opts = opts || {};
    return new StateToContent(opts);
};

module.exports = AuthorArchive;
