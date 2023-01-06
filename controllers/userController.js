const express = require("express");
const fs = require("fs");

exports.getAllUsers = (req, res) => {
  res.status(200).end(`You hit ${req.url} endpoint`);
};

exports.createNewUser = (req, res) => {
  res.status(200).end(`You hit ${req.url} endpoint`);
};

exports.getUserById = (req, res) => {
  res.status(200).end(`You hit ${req.url} endpoint`);
};
