var libxmljs = require("libxmljs");


module.exports = function(kml) {
    var svg = "test";
    var view = {
        minX: false,
        maxX: false,
        minY: false,
        maxY: false
    };
    var kmlPolygons = [];
    var doc = libxmljs.parseXml(kml);

    // recuperer les polygones
    var polygons = doc.find('//kml:Polygon', {kml: "http://www.opengis.net/kml/2.2"});

    if (polygons.length > 0) {
        for(var i = 0, l = polygons.length; i < l; i++) {
            var tempKmlPolygon = {
                data: {},
                points: []
            };

            // commuler les nodes coordinates
            var coords = polygons[i].find("//kml:coordinates", {kml: "http://www.opengis.net/kml/2.2"})
                        .reduce(function(val, node) {
                                return val + node.text().trim();
                        }, "");
            
            var points = coords.split(' ');
            for(var j = 0, pl = points.length; j < pl; j++) {
                var point = points[j].split(',');
                // 
                // 0: x, 1: y, 2: z
                // Trouver les coords les plus faibles et plus elevees pour determiner la view
                if ((view.minX === false) || (Number(point[0]) < view.minX)) {
                    if(!isNaN(Number(point[0]))) {
                        view.minX = Number(point[0]);
                    }
                }
                if ((view.maxX === false) || (Number(point[0]) > view.maxX)) {
                    if(!isNaN(Number(point[0]))) {
                        view.maxX = Number(point[0]);
                    }
                }
                if ((view.minY === false) || (Number(point[1]) < view.minY)) {
                    if(!isNaN(Number(point[1]))) {
                        view.minY = Number(point[1]);
                    }
                }
                if ((view.maxY === false) || (Number(point[1]) > view.maxY)) {
                    if(!isNaN(Number(point[1]))) {
                        view.maxY = Number(point[1]);
                    }
                }
                tempKmlPolygon.points.push({
                    x: Number(point[0]),
                    y: Number(point[1]),
                    z: Number(point[2])
                });
            }

            kmlPolygons.push(tempKmlPolygon);
        }
    }
    console.log("boundaries", view);
    // on a les limites : calculer le ratio pour trouver le nouveau referentiel pour le svg
    var multiplier = 10;
    var Xdiff = 0;
    if (view.minX < 0) Xdiff = 1 + view.minX;
    else if (view.minX > 0) Xdiff = 0 - view.minX;
    var Ydiff = 0;
    if (view.minY < 0) Ydiff = 1 + view.minY;
    else if (view.minY > 0) Ydiff = 0 - view.minY;
    console.log("Xdiff:", Xdiff, "Ydiff:", Ydiff);
    // convertir tous les points sur le nouveau referentiel
    kmlPolygons = kmlPolygons.map(function(v) {
        return {
            data: v.data,
            points: v.points.map(function(vv) {
                return {
                    x: (vv.x + Xdiff) * multiplier,
                    y: (vv.y + Ydiff) * multiplier,
                    z: (vv.z)
                };
            })
        };
    });
    
    // creer le svg
    return svg;
};
