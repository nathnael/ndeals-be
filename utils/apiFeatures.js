class APIFeatures {
    constructor(query, queryString, productsCount) {
        this.query = query;
        this.queryStr = queryString;
        this.productsCount = productsCount;
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
                // console.log(`queryStr: ${JSON.stringify(queryStr)}`); 
                if (queryStr.size && queryStr.size!==null && queryStr.size!=='') {
                    if (queryStr.size.in && queryStr.size.in!==null && queryStr.size.in!=='') {
                        queryStr.size.in = queryStr.size.in.split(',');
                    }
                    else {
                        delete queryStr.size;      
                    }
                }
                if (queryStr.color && queryStr.color!==null && queryStr.color!=='') {
                    if (queryStr.color.in && queryStr.color.in!==null && queryStr.color.in!=='') {
                        queryStr.color.in = queryStr.color.in.split(',');
                        queryStr.color.in = queryStr.color.in.map((c) => `#${c}`);
                    }
                    else {
                        delete queryStr.color;      
                    }
                }
                if (queryStr.brand && queryStr.brand!==null && queryStr.brand!=='') {
                    if (queryStr.brand.in && queryStr.brand.in!==null && queryStr.brand.in!=='') {
                        queryStr.brand.in = queryStr.brand.in.split(',');
                    }
                    else {
                        delete queryStr.brand;      
                    }
                }
            }
            // Serializing the modified query back to a string
            queryStr = JSON.stringify(queryStr);

            queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
            queryStr = queryStr.replace(/\b(category)\b/g, match => `${match}.name`);
            queryStr = queryStr.replace(/\b(size)\b/g, match => `variants.${match}`);
            queryStr = queryStr.replace(/\b(color)\b/g, match => `variants.${match}`);
            queryStr = queryStr.replace(/\b(brand)\b/g, match => `variants.${match}`);
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
        let skip = perPage * (currentPage - 1 );
        skip = (this.productsCount && skip >= this.productsCount) ? 0 : skip;

        console.log(`currentPage: ${currentPage}`); 
        console.log(`perPage: ${perPage}`); 
        console.log(`skip: ${skip}`); 


        this.query = this.query.limit(perPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;