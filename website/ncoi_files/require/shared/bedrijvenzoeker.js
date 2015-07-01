var Bedrijvenzoeker = function (undefined) {

    'use strict';

    function getCompanyInformation(bedrijfsnaam, jwt) {
        if (jwt == null) {
            throw "Bedrijven zoeker is dependent on JWT key";
        }

        return $.ajax({
            url: '/CMSPages/WebService.asmx/GetCompanies',
            data: JSON.stringify({ query: bedrijfsnaam, tokenPassed: jwt }),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        });
    }

    return {
        getCompanyInformation: getCompanyInformation,
    };
};