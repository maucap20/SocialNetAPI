const { Thought, User } = require("../models");

module.exports = {
  // Get all thoughts
  async getThoughts(req, res) {
    try {
      const thoughts = await Thought.find();
      res.json(thoughts);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Get a single thought by ID
  async getThought(req, res) {
    try {
      const thought = await Thought.findOne({
        _id: req.params.thoughtId,
      }).select("-__v");

      if (!thought) {
        return res
          .status(404)
          .json({ message: "No thought found with that ID." });
      }

      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Create a new thought
  async createThought(req, res) {
    try {
      const thoughtData = await Thought.create(req.body);

      const thoughtOwner = await User.findOneAndUpdate(
        { _id: req.body.userId },
        { $push: { thoughts: thoughtData._id } },
        { new: true }
      );

      if (!thoughtOwner) {
        return res.status(404).json({ message: "No user found with that ID." });
      }

      res.json(thoughtOwner);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Update a thought by ID
  async updateThought(req, res) {
    try {
      const updatedThought = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $set: req.body },
        { runValidators: true, new: true }
      );

      if (!updatedThought) {
        return res
          .status(404)
          .json({ message: "No thought found with this ID." });
      }

      res.json(updatedThought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Delete a thought by ID
  async deleteThought(req, res) {
    try {
      const deletedThought = await Thought.findOneAndDelete({
        _id: req.params.thoughtId,
      });

      if (!deletedThought) {
        return res
          .status(404)
          .json({ message: "No thought found with this ID." });
      }

      // Remove thought from user's thoughts array
      const thoughtOwner = await User.findOneAndUpdate(
        { thoughts: req.params.thoughtId },
        { $pull: { thoughts: req.params.thoughtId } },
        { new: true }
      );

      if (!thoughtOwner) {
        return res.status(404).json({ message: "No user found with this ID." });
      }

      res.json({ message: "Thought deleted successfully!" });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Create a reaction for a thought
  async createReaction(req, res) {
    try {
      const updatedThought = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $addToSet: { reactions: req.body } },
        { runValidators: true, new: true }
      );

      if (!updatedThought) {
        return res
          .status(404)
          .json({ message: "No thought found with this ID." });
      }

      res.json(updatedThought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Delete a reaction from a thought
  async deleteReaction(req, res) {
    try {
      const updatedThought = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $pull: { reactions: { reactionId: req.params.reactionId } } },
        { runValidators: true, new: true }
      );

      if (!updatedThought) {
        return res
          .status(404)
          .json({ message: "No thought or reaction found with this ID." });
      }

      res.json(updatedThought);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
