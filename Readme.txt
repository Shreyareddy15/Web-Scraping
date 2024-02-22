Web Scraping Project:

#To run the project
Step-1: In Terminal go to project folder and enter "node scrape.js"
Step-2: Then open postman
 	and enter POST "http://localhost:3000/scrape-homes" and 
in raw
 { 
    "searchString": "Apartments.com",
    "cityName": "Birmingham AL"
}

Then it redirects to the google.com directly to Top Listing homes webistes.
gets some data from that website:
{
    "data": [
        {
            "title": "Retreat at Greystone",
            "price": "$1,191 - 4,674",
            "bedrooms": "1-3 Beds"
        },
        {
            "title": "Goodall-Brown Lofts",
            "price": "$1,625",
            "bedrooms": "1-2 Beds"
        },
        {
            "title": "The Murals on Niazuma",
            "price": "$895 - 1,100",
            "bedrooms": "1-2 Beds"
        },
        {
            "title": "600 19th St N Unit 2213.1402997",
            "price": "$2,325",
            "bedrooms": "2 Beds"
        },
        {
            "title": "4700 Colonnade Pl Unit 4730-221.887",
            "price": "$2,121",
            "bedrooms": "1 Bed"
        }......
    ]
}
