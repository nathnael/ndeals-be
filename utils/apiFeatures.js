class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryStr = queryString;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {};

        // console.log(keyword);
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        try {
            const queryCopy = { ...this.queryStr };

            //Removing fields from the query
            const removeFields = ['keyword', 'limit', 'page', 'perPage'];
            removeFields.forEach(el => delete queryCopy[el]);        

            // Advanced filter for price, ratings, etc.
            let queryStr = JSON.stringify(queryCopy);
            queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
            queryStr = queryStr.replace(/\b(category)\b/g, match => `${match}.name`);

            console.log(`queryStr: ${queryStr}`);

            this.query = this.query.find(JSON.parse(queryStr));
            
            return this;
        } catch(e) {
            console.log(`Error: ${e}`);
        }
    }

    pagination() {
        const currentPage = Number(this.queryStr.page) || 1;
        const perPage = Number(this.queryStr.perPage) || 12;
        const skip = perPage * (currentPage - 1 );

        this.query = this.query.limit(perPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;