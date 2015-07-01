var Postcodezoeker = function (undefined) {

    'use strict';

    function getAddress(postcode, housenumber, jwt) {
        if (jwt == null) {
            throw "Postcode zoeker is dependent on JWT key";
        }

        return $.ajax({
            url: '/CMSPages/WebService.asmx/Address',
            data: JSON.stringify({ tokenPassed: jwt, postalCode: postcode, houseNumber: housenumber }),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        });
    }

    return {
        getAddress: getAddress,
    };
};