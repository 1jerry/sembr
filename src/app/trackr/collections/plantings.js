define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {

    var Plantings = Collection.extend({

		  model: function(attrs, options) {
		    if(!attrs){
		  		return sembr.trackr.models.Planting;
		  	}
		    return sembr.trackr.models.Planting.create(attrs, options);
		  },

		  comparator: function(chapter) {
			  return chapter.get("planted_from");
			},
			

			/**
      * Returns a new Plantings collections filterered by the presence of
      * the provided models as associations to the planting models
      */
			filterByModels: function( models ){
			  var filtered;
			  
			  console.log('Filtering plantings by models %o', models);
        
        if( !models || !models.length ){
          console.warn('No models provided to filter, returning all models');
          return this;
        }
        
			  filtered = this.filter( function( planting ){
			    var result = false;
          _( models ).each( function( model ){
            switch( model.get('type') ){
              case 'plant':
                if( planting.get('plant_id') === model.get('id') )
                  result = true;
                break;
              case 'place':
                if( planting.get('place_id') === model.get('id') )
                  result = true;
                break;
              default:
              break;
            }
          });
          
          return result;
        });
        console.log('Filtered plantings %o', filtered);
			  
			  return new Plantings( filtered );
			}

		});

    return Plantings;
  });