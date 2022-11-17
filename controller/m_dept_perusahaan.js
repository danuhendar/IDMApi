
var mysqlLib = require('../connection/mysql_connection');
var gs = require('../controller/global_service');

const get_MasterDeptPerusahaan = (req, res) => {
  mysqlLib.executeQuery('select * from m_dept_perusahaan').then((d) => {
  	var code = 200;
    var res_msg = gs.create_msg("Sukses",code,d);
    res.status(code).json(res_msg);
  }).catch(e => {
    console.log(e);
    var res_msg = gs.create_msg(e.Stack,500,"");
    res.status(code).json(res_msg);
  });
}

const ins_MasterDeptPerusahaan = (req, res) => {
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_DEPT = obj.KODE_DEPT;
  var IN_CONTENT = obj.CONTENT;

  mysqlLib.executeQuery("insert into m_dept_perusahaan VALUES('"+IN_KODE_DEPT+"','"+IN_CONTENT+"');").then((d) => {
    console.log(d.affectedRows);
    var code = 200;
    if(d.affectedRows == 1)
    {
    	var res_msg = gs.create_msg("Data berhasil disimpan",code,"");
    	res.status(code).json(res_msg);
    }
    else
    {	
    	var res_msg = gs.create_msg("Data gagal disimpan",code,"");
    	res.status(code).json(res_msg);
    }
    
  }).catch(e => {
    console.log(e);
    var code = 500;
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
  });
}

const del_MasterDeptPerusahaan = (req, res) => {
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_DEPT = obj.KODE_DEPT;
  
  mysqlLib.executeQuery("delete from m_dept_perusahaan WHERE KODE_DEPT = '"+IN_KODE_DEPT+"';").then((d) => {
    console.log(d.affectedRows);
    var code = 200;
    if(d.affectedRows == 1)
    {
    	var res_msg = gs.create_msg("Data berhasil dihapus",code,"");
    	res.status(code).json(res_msg);
    }
    else
    {	
    	var res_msg = gs.create_msg("Data gagal dihapus",code,"");
    	res.status(code).json(res_msg);
    }
    
  }).catch(e => {
    console.log(e);
    var code = 500;
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
  });
}

const upd_MasterDeptPerusahaan = (req, res) => {
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_DEPT = obj.KODE_DEPT;
  var IN_CONTENT = obj.CONTENT;
  
  mysqlLib.executeQuery("update m_dept_perusahaan SET CONTENT = '"+IN_CONTENT+"' WHERE KODE_DEPT =  '"+IN_KODE_DEPT+"';").then((d) => {
    console.log(d.affectedRows);
    var code = 200;
    if(d.affectedRows == 1)
    {
    	var res_msg = gs.create_msg("Data berhasil diupdate",code,"");
    	res.status(code).json(res_msg);
    }
    else
    {	
    	var res_msg = gs.create_msg("Data gagal diupdate",code,"");
    	res.status(code).json(res_msg);
    }
    
  }).catch(e => {
    console.log(e);
    var code = 500;
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
  });
}

module.exports = {
  get_MasterDeptPerusahaan,
  ins_MasterDeptPerusahaan,
  del_MasterDeptPerusahaan,
  upd_MasterDeptPerusahaan
}
