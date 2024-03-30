class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  Filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ["page", "sort", "limit", "fields", "q"];
    excludesFields.forEach((field) => {
      delete queryStringObj[field];
    });
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    });
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }
  Sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createAt");
    }
    return this;
  }
  LimitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }
  Search() {
    if (this.queryString.q) {
      this.mongooseQuery = this.mongooseQuery.find({
        // $or: [
        //   {
        title: { $regex: this.queryString.q, $options: "i" },
        // },
        // { description: { $regex: this.queryString.q, $options: "i" } },
        // ],
      });
    }
    return this;
  }
  Paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 16;
    const skip = (page - 1) * limit;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
