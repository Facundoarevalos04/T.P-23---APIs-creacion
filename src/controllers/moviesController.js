const path = require("path");
const db = require("../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require("moment");

//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const moviesController = {
  list: (req, res) => {
    db.Movie.findAll({
      include: ["genre"],
    }).then((movies) => {
      res.render("moviesList.ejs", { movies });
    });
  },
  detail: (req, res) => {
    db.Movie.findByPk(req.params.id, {
      include: ["genre"],
    }).then((movie) => {
      res.render("moviesDetail.ejs", { movie });
    });
  },
  new: (req, res) => {
    db.Movie.findAll({
      order: [["release_date", "DESC"]],
      limit: 5,
    }).then((movies) => {
      res.render("newestMovies", { movies });
    });
  },
  recomended: (req, res) => {
    db.Movie.findAll({
      include: ["genre"],
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    }).then((movies) => {
      res.render("recommendedMovies.ejs", { movies });
    });
  },
  //Aqui dispongo las rutas para trabajar con el CRUD
  add: function (req, res) {
    let promGenres = Genres.findAll();
    let promActors = Actors.findAll();

    Promise.all([promGenres, promActors])
      .then(([allGenres, allActors]) => {
        return res.render(path.resolve(__dirname, "..", "views", "moviesAdd"), {
          allGenres,
          allActors,
        });
      })
      .catch((error) => res.send(error));
  },
  create: async  (req, res) =>{

     try {

      const {title, rating, length, awards, genre_id, release_date} = req.body;

     const movie = await db.Movie.create({
        title: title,
        rating: rating,
        awards: awards,
        length : length,
        genre_id : genre_id,
        release_date : release_date ? release_date : null,
      });

      console.log(movie + 'holaaa')

      return res.status(201).json({
        ok: true,
        status: 201,
        msg: "pelicula agregada :D",
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        status: 500,
        msg: "No se pudo crear la pelicula",
      });
    }
  

    /*try {
      await db.Movie.create({
        id,
        title: title,
        rating: rating,
        awards: awards,
        length: length,
        genre_id: genre_id,
      })

      return res.status(201).json({
        ok: true,
        status: 201,
        msg: "Pelicula agregada",
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        status: 500,
        msg: "no se pudo agregar la Pelicula ",
      });
    } */
   
   
  },
  edit: function (req, res) {
    let movieId = req.params.id;
    let promMovies = Movies.findByPk(movieId, { include: ["genre", "actors"] });
    let promGenres = Genres.findAll();
    let promActors = Actors.findAll();
    Promise.all([promMovies, promGenres, promActors])
      .then(([Movie, allGenres, allActors]) => {
        Movie.release_date = moment(Movie.release_date).format("L");
        return res.render(
          path.resolve(__dirname, "..", "views", "moviesEdit"),
          { Movie, allGenres, allActors }
        );
      })
      .catch((error) => res.send(error));
  },
  update: function (req, res) {
    let movieId = req.params.id;
    Movies.update(
      {
        title: req.body.title,
        rating: req.body.rating,
        awards: req.body.awards,
        release_date: req.body.release_date,
        length: req.body.length,
        genre_id: req.body.genre_id,
      },
      {
        where: { id: movieId },
      }
    )
      .then(() => {
        return res.redirect("/movies");
      })
      .catch((error) => res.send(error));
  },
  delete: function (req, res) {
    let movieId = req.params.id;
    Movies.findByPk(movieId)
      .then((Movie) => {
        return res.render(
          path.resolve(__dirname, "..", "views", "moviesDelete"),
          { Movie }
        );
      })
      .catch((error) => res.send(error));
  },
  destroy: async (req, res) => {
    const { id } = req.params;

    try {
      
      await db.Movie.destroy({where : {id}});

      if(isNaN(id)){

        res.status(404).json({
          ok: false,
          status: 404,
          msg: 'Solo caracteres numericos'
        })

      }else{

        res.status(200).json({
          ok: true,
          status: 200,
          msg: "Pelicula eliminada :D",
        })
        
      }

      ;
      
    } catch (error) {
      res.status(500).json({
        ok: false,
        status: 500,
        msg: "No se pudo eliminar la pelicula :c",
      });
    }
  },
  
};

module.exports = moviesController;
