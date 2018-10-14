#!/usr/bin/env bash

rm -rf js/lib/*
rm -rf css/lib/*
rm -rf css/fonts/*

cp node_modules/jquery/dist/jquery.min.js js/lib/
cp node_modules/bootstrap/dist/js/bootstrap.bundle.min.js js/lib/
cp node_modules/bootstrap/dist/css/bootstrap.min.css css/lib/
cp node_modules/bootstrap-select/dist/js/bootstrap-select.min.js js/lib/
cp node_modules/bootstrap-select/dist/css/bootstrap-select.min.css css/lib/
cp node_modules/sortablejs/Sortable.min.js js/lib/sortable.min.js
cp node_modules/font-awesome/css/font-awesome.min.css css/lib/
cp -r node_modules/font-awesome/fonts css/
