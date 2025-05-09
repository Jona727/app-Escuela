from fastapi import APIRouter
from model.user import session, InputUser, User , InputLogin, UserDetail, InputUserDetail 


user = APIRouter()



@user.get("/users/all")
def get_users():
    try:
        return session.query(User).all()
    except Exception as ex:
        print(ex)


@user.get("/users/login/{n}")
def get_users_id(n: str):
    try:
        return session.query(User).filter(User.username == n).first()
    except Exception as ex:return ex
   
@user.post("/users/new")
def crear_usuario(user: InputUser):
   try: 
        usuNuevo = User(
            user.username,
            user.password,
            
        )
        session.add(usuNuevo)
        session.commit()
        return "usuario agregado"
   except Exception as ex:
    
       return ex
   
   

@user.post("/users/loginUser")
def login_post(user: InputLogin):
    try:
        usu = User(0, user.username, user.password, "", "")
        res = session.query(User).filter(User.username == usu.username).first()
        if res.password == usu.password:
            print("usuario correcto")
            return res
        else:
            return None
    except Exception as e:
        print(e)


#agregamos en clase presencial 9/5
@userDetail.post("/userdetail/add")
def add_usuarDetail(userDet: InputUserDetail):
   usuNuevo = UserDetail(
   userDet.dni, userDet.firstName, userDet.lastName, userDet.type,           userDet.email
   )
   session.add(usuNuevo)
   session.commit()
   return "usuario detail agregado"


@userDetail.get("/userdetail/all")
def get_userDetails():
   try:
       return session.query(UserDetail).all()
   except Exception as e:
       print(e)

