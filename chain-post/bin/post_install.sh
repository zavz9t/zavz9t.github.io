#!/usr/bin/env bash

rm -rf js/lib/*
rm -rf css/lib/*

cp node_modules/jquery/dist/jquery.min.js js/lib/
cp node_modules/bootstrap/dist/js/bootstrap.bundle.min.js js/lib/
cp node_modules/bootstrap/dist/css/bootstrap.min.css css/lib/
