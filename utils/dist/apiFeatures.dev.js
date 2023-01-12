"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var APIFeatures =
/*#__PURE__*/
function () {
  function APIFeatures(query, queryString) {
    _classCallCheck(this, APIFeatures);

    this.query = query;
    this.queryStr = queryString;
  }

  _createClass(APIFeatures, [{
    key: "search",
    value: function search() {
      var keyword = this.queryStr.keyword ? {
        name: {
          $regex: this.queryStr.keyword,
          $options: 'i'
        }
      } : {}; // console.log(keyword);

      this.query = this.query.find(_objectSpread({}, keyword));
      return this;
    }
  }, {
    key: "filter",
    value: function filter() {
      try {
        var queryCopy = _objectSpread({}, this.queryStr); //Removing fields from the query


        var removeFields = ['keyword', 'limit', 'page', 'perPage'];
        removeFields.forEach(function (el) {
          return delete queryCopy[el];
        }); // Advanced filter for price, ratings, etc.

        var queryStr = JSON.stringify(queryCopy);
        queryStr = JSON.parse(queryStr);

        if (queryStr && queryStr !== null && queryStr !== '') {
          // console.log(`queryStr: ${queryStr}`); 
          if (queryStr.size && queryStr.size !== null && queryStr.size !== '') {
            // console.log(`queryStr.size: ${queryStr.size}`);
            if (queryStr.size["in"] && queryStr.size["in"] !== null && queryStr.size["in"] !== '') {
              // console.log(`queryStr.size.in: ${queryStr.size.in}`); 
              queryStr.size["in"] = queryStr.size["in"].split(',');
            } else {
              delete queryStr.size;
            }
          }
        } // Serializing the modified query back to a string


        queryStr = JSON.stringify(queryStr);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, function (match) {
          return "$".concat(match);
        });
        queryStr = queryStr.replace(/\b(category)\b/g, function (match) {
          return "".concat(match, ".name");
        });
        queryStr = queryStr.replace(/\b(size)\b/g, function (match) {
          return "variants.".concat(match);
        });
        queryStr = queryStr.replace(/\b(in)\b/g, function (match) {
          return "$".concat(match);
        }); // console.log(`queryStrFinal: ${queryStr}`); 

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
      } catch (e) {
        console.log("Error: ".concat(e));
      }
    }
  }, {
    key: "pagination",
    value: function pagination() {
      var currentPage = Number(this.queryStr.page) || 1;
      var perPage = Number(this.queryStr.perPage) || 12;
      var skip = perPage * (currentPage - 1);
      this.query = this.query.limit(perPage).skip(skip);
      return this;
    }
  }]);

  return APIFeatures;
}();

module.exports = APIFeatures;