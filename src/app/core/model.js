/** 
 * SembrModel class
 *
 * Defines a model class which can autoload it's dependencies. 
 **/
define(["underscore", "backbone", 'pouchdb', 'backbone.supermodel'],
function(_, Backbone, Pouch, Supermodel ) {
  var SembrModel = Supermodel.Model.extend( 

  // INSTANCE METHODS 
  {
    

    initialize: function(){
      console.log('Initializing model ', this.name, arguments);
      //array of active association names on this model instance
      this._associations = [];

      this.processRelatedDocs();

      //keep an array of active association names so we can know the getter names to use.
      //without this there is no way to access associations programatically

      this.on('associate', function(property, inverse_property, model, inverse_model){
        console.log('Model %s (%s): received associate event %o with inverse_property %o; model %o; inverse_model:%o', this.name, this.cid, property, inverse_property, model, inverse_model);
        //add the association to this model instance
        _(inverse_model._associations).contains(property) || inverse_model._associations.push(property);
        //add the association to the associated model instance
        _(this._associations).contains(inverse_property) || this._associations.push(inverse_property)
      }.bind(this));
      this.on('disassociate', function(property, inverse_property, inverse_model, inverse_model){
        //model._associations = _(model._associations).without(inverse_property);
        inverse_model._associations = _(inverse_model._associations).without(property);
        this._assocations = _(this._assocations).without(inverse_property);
        console.log('Model %s (%s): received associate event %o with inverse_property %o; model %o; inverse_model:%o', this.name, this.cid, property, inverse_property, model, inverse_model);
      }.bind(this));
      this.on('all', function(){
        //console.log('Model event: ', arguments);
      });

      Supermodel.Model.prototype.initialize.apply(this, arguments);

    },

    //define getters and setters for attribute values...
    defineAttribute: function(key) {
      var model = this;
      //silently fail if the object already has a property with this name
      //this could be because this method has already run for the property
      //or it has already been defined as an actual object property
      if(!this.hasOwnProperty(key)){
        Object.defineProperty(model, key, {
          get: function () { 
            if(this['__'+key]){
              return this['__'+key]();
            }else{
              return model.get(key);
            }
          },
          set: function (value) { 
            if(this['__'+key]){
              return this['__'+key]();
            }else{
              return model.set(key, value);
            }
          }
        });
      }
    },

    processRelatedDocs: function(){
      if(this.relatedDocs){
        _(this.relatedDocs).each(function(rel){
          _(rel).defaults({
            source: 'local',
            autoload: true
          });
        });
      }
    },


    toJSON: function(options){
      var json;
      options = _(options || {}).defaults({
        include_associations: false
      });

      //defer to previous implementation for this objects attributes
      json = Supermodel.Model.prototype.toJSON.apply(this, arguments);
      if(options.include_associations){
        //one include associations to one level deep to prevent recursion
        options.include_associations = false;
        _(this._associations).each(function(name){
          json[name] = this[name]().toJSON(options);
        }, this);
      }
      return json;
    },


  },

  // STATIC METHODS 
  {

  	findOrFetch: function(attributes){
    	var model, deferred;
    	deferred = new $.Deferred();
    	model = this.find(attributes);
    	if(model){
    		deferred.resolve(model);
    	}else{
        console.log('findOrFetch: Instantiating new model %o with attrs %o', this, attributes);
	    	new this(attributes)
	    		.fetch()
	    		.done(function(new_model, data){
	    			deferred.resolve(new_model, data);
	    		})
	    		.fail(function(){
	    			console.error("Failed to fetch model");
	    		});
    	}
    	return deferred.promise();
    },

  });

  return SembrModel;


});