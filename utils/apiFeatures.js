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

            queryStr = JSON.parse(queryStr);
            if (queryStr && queryStr!==null && queryStr!=='') {
                // console.log(`queryStr: ${queryStr}`); 
                if (queryStr.size && queryStr.size!==null && queryStr.size!=='') {
                    // console.log(`queryStr.size: ${queryStr.size}`);
                    if (queryStr.size.in && queryStr.size.in!==null && queryStr.size.in!=='') {
                        // console.log(`queryStr.size.in: ${queryStr.size.in}`); 
                        queryStr.size.in = queryStr.size.in.split(',');
                    }
                    else {
                        delete queryStr.size;      
                    }
                }
            }
            // Serializing the modified query back to a string
            queryStr = JSON.stringify(queryStr);

            queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
            queryStr = queryStr.replace(/\b(category)\b/g, match => `${match}.name`);
            queryStr = queryStr.replace(/\b(size)\b/g, match => `variants.${match}`);
            queryStr = queryStr.replace(/\b(in)\b/g, match => `$${match}`);
            
            // console.log(`queryStrFinal: ${queryStr}`); 

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