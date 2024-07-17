const Sequelize = require('sequelize');
const ModelFactory = require('../models/modelFactory');
const Tought = ModelFactory.createModel('Tought');
const User = ModelFactory.createModel('User');
const logDecorator = require('../decorators/logDecorator');
const formatHumanDate = require("../helpers/date").formatHumanDate;


class ToughtController {
  static async showToughts(req, res) {
    const search = req.query.search || '';
    const order = req.query.order === 'old' ? 'ASC' : 'DESC';

    let toughts = [];
    let toughtsQty = 0;

    try {
      if (search) {
        toughts = await Tought.findAll({
          where: {
            title: {
              [Sequelize.Op.like]: `%${search}%`
            }
          },
          include: User,
          order: [['updatedAt', order]]
        });
        toughtsQty = toughts.length;
      } else {
        toughts = await Tought.findAll({ include: User, order: [['updatedAt', order]] });
        toughtsQty = toughts.length;
      }

      toughts.forEach((item)=>{
        item.dataValues.updatedAt = require("../helpers/date").formatHumanDate(item.dataValues.updatedAt)
      })
      console.log("toughts")
      console.log(toughts)

      res.render('toughts/home', { toughts, search, toughtsQty });
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  }

  static async createTought(req, res) {
    res.render('toughts/create');
  }

  static async createToughtSave(req, res) {
    const { title } = req.body;
    const userId = req.session.userid;
    console.log(`UserID in session before creating tought: ${userId}`);

    try {
      const newTought = await Tought.create({ title, UserId: userId });
      req.logAction('Create Tought', req, { userId, title: newTought.title });
      req.flash('message', 'Pensamento criado com sucesso!');
      req.session.save(() => {
        res.redirect('/toughts/dashboard');
      });
    } catch (error) {
      console.error(error);
      res.redirect('/toughts/dashboard');
    }
  }

  static async removeTought(req, res) {
    const id = req.body.id;
    const userId = req.session.userid;
    console.log(`UserID in session before removing tought: ${userId}`);

    try {
      const tought = await Tought.findOne({ where: { id: id, UserId: userId } });
      if (tought) {
        await Tought.destroy({ where: { id: id } });
        req.logAction('Remove Tought', req, { userId, title: tought.title });
        req.flash('message', 'Pensamento removido com sucesso!');
        req.session.save(() => {
          res.redirect('/toughts/dashboard');
        });
      } else {
        res.redirect('/toughts/dashboard');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/toughts/dashboard');
    }
  }

  static async updateTought(req, res) {
    const id = req.params.id;
    try {
      const tought = await Tought.findOne({ where: { id: id }, raw: true });
      res.render('toughts/edit', { tought });
    } catch (error) {
      console.error(error);
      res.redirect('/toughts/dashboard');
    }
  }

  static async updateToughtPost(req, res) {
    const id = req.body.id;
    const userId = req.session.userid;
    console.log(`UserID in session before updating tought: ${userId}`);

    try {
      const updatedTought = {
        title: req.body.title,
      };

      await Tought.update(updatedTought, { where: { id: id } });

      req.logAction('Update Tought', req, {
        userId,
        title: updatedTought.title
      });

      req.flash('message', 'Pensamento atualizado com sucesso!');
      req.session.save(() => {
        res.redirect('/toughts/dashboard');
      });
    } catch (error) {
      console.error(error);
      res.redirect('/toughts/dashboard');
    }
  }

  static async dashboard(req, res) {
    const userId = req.session.userid;
    try {
      const user = await User.findOne({
        where: { id: userId },
        include: Tought,
        plain: true,
      });

      if (!user) {
        res.redirect('/login');
      }

      const toughts = user.Toughts.map((result) => result.dataValues);
      const emptyToughts = toughts.length === 0;

      res.render('toughts/dashboard', { toughts, emptyToughts });
    } catch (error) {
      console.error(error);
      res.redirect('/login');
    }
  }
}

// Aplicar o decorador manualmente aos métodos
ToughtController.showToughts = logDecorator(ToughtController.showToughts);
ToughtController.createTought = logDecorator(ToughtController.createTought);
ToughtController.createToughtSave = logDecorator(ToughtController.createToughtSave);
ToughtController.removeTought = logDecorator(ToughtController.removeTought);
ToughtController.updateTought = logDecorator(ToughtController.updateTought);
ToughtController.updateToughtPost = logDecorator(ToughtController.updateToughtPost);
ToughtController.dashboard = logDecorator(ToughtController.dashboard);

module.exports = ToughtController;
