// implement your posts router here
const express = require('express');
const Post = require('./posts-model');
const router = express.Router();

router.get('/', (req, res) => {
    Post.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => {
            res.status(500).json({ error: 'The posts information could not be retrieved.' });
        });
});

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: 'The post with the specified ID does not exist.' });
            }
        })
        .catch(error => {
            res.status(500).json({ error: 'The post information could not be retrieved.' });
        });
});

router.post('/', (req, res) => {
    const { title, contents } = req.body;
    if (!title || !contents) {
        res.status(400).json({ message: 'Please provide both a title and some content for the post.' });
    } else {
        Post.insert({ title, contents })
            .then(post => {
                return Post.findById(post.id);
            })
            .then(post => {
                res.status(201).json(post);
            })
            .catch(error => {
                res.status(500).json({ error: 'The post information could not be saved.' });
            });
    }
});

router.delete('/:id', (req, res) => {
    Post.remove(req.params.id)
        .then(post => {
            if (post) {
                return Post.findById(post.id);
            } else {
                res.status(404).json({ message: 'The post with the specified ID does not exist.' });
            }
        })
        .catch(error => {
            res.status(500).json({ error: 'The post could not be removed.' });
        });
});

router.put('/:id', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        res.status(400).json({ message: 'Please provide both a title and some content for the post.' });
    } else {
        Post.findById(req.params.id)
            .then(post => {
                if (post) {
                    post.title = title;
                    post.content = content;
                    return post.save();
                } else {
                    res.status(404).json({ message: 'The post with the specified ID does not exist.' });
                }
            })
            .then(post => {
                if (post) res.status(200).json(post);
            })
            .catch(error => {
                res.status(500).json({ error: 'The post information could not be updated.' });
            });
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: 'The post with the specified ID does not exist.' });
        } else {
            const comments = await Post.findPostComments(req.params.id);
            res.status(200).json(comments);
        }
    } catch (error) {
        res.status(500).json({ error: 'The comments for the post could not be retrieved.', err: err.message, stack: err.stack });
    }    
});

module.exports = router;