from fastapi import APIRouter, Request, HTTPException
from models.modelo import UpdateUserProfile, InputLogin, Curso, InputUserAddCurso , session, Session, SignupUser, InputUser, User, UserDetail, ChangePasswordInput, PivoteUserCurso
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from .auth.security import Security

user = APIRouter()


@user.get("/")
def welcome():
    return "Bienvenido!!"


@user.get("/users/all")
def obtener_usuarios(req: Request):
    try:
        token_data = Security.verify_token(req.headers)
        if token_data.get("status") == "error":
            return JSONResponse(status_code=401, content=token_data)


        usuarios = (
            session.query(User, UserDetail, PivoteUserCurso, Curso)
            .join(UserDetail, User.id == UserDetail.user_id)
            .outerjoin(PivoteUserCurso, PivoteUserCurso.id_user == User.id)
            .outerjoin(Curso, PivoteUserCurso.id_curso == Curso.id)
            .filter(UserDetail.active != None)
            .order_by(User.active.desc())
            .all()
        )


        resultado = []
        for user, detail, pivote, curso in usuarios:
            resultado.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "dni": detail.dni,
                "firstname": detail.firstName,
                "lastname": detail.lastName,
                "type": detail.type,
                "curso": curso.name if curso else None,
                "active": user.active
            })


        return resultado


    except Exception as e:
        print("Error al obtener usuarios:", e)
        return JSONResponse(status_code=500, content={"status": "error", "message": "Error interno del servidor"})


    finally:
        session.close()

@user.post("/users/signup")
def signup_user(us: SignupUser):
    try:
        # VERIFICA
        existing_user = session.query(User).filter(
            (User.username == us.username) | (User.email == us.email)
        ).first()
        if existing_user:
            return JSONResponse(status_code=400, content={"status": "error", "message": "El username o email ya existe"})

        # Crear el USUARIO
        new_user = User(username=us.username, password=us.password, email=us.email)
        session.add(new_user)
        session.commit()

        # Crea UserDetail.
        new_user_detail = UserDetail(
            dni=us.dni,
            firstName=us.firstname,
            lastName=us.lastname,
            type=us.type, 
            user_id=new_user.id
        )
        session.add(new_user_detail)
        session.commit()

        return {
            "status": "success",
            "user": {
                "id": new_user.id,
                "username": new_user.username
            },
            "message": "Usuario creado correctamente"
        }

    except Exception as ex:
        print("Error -->", ex)
        session.rollback()
        return JSONResponse(status_code=500, content={"status": "error", "message": "Error interno del servidor"})

    finally:
        session.close()

@user.post("/users/loginUser")
def login_user(us: InputLogin):
    try:
        user = session.query(User).filter(User.username == us.username).first()
        if user and user.password == us.password:
            tkn = Security.generate_token(user)
            if not tkn:
                return {"message":"Error en la generación del token!"}
            else:
                res = {
                    "status": "success",
                    "token": tkn,
                    "user": user.userdetail,
                    "message":"User logged in successfully!"
                }
                print(res)
                return res
        else:
            res={"message": "Invalid username or password"}
            print(res)
            return res
    except Exception as ex:
        print(f"Error ---->>> {ex}")
    finally:
        session.close()

## Inscribir un alumno a un curso
@user.post("/user/addcurso")
def addCurso(req: Request, ins: InputUserAddCurso):
    session = Session()
    try:
        # Validar token del usuario
        token_data = Security.verify_token(req.headers)
        if token_data.get("status") == "error":
            return JSONResponse(status_code=401, content=token_data)

        # Verificar si ya está inscripto
        existe = session.query(PivoteUserCurso).filter_by(
            id_user=ins.id_user,
            id_curso=ins.id_curso
        ).first()

        if existe:
            return JSONResponse(status_code=400, content={"detail": "El alumno ya está inscripto en ese curso"})

        # Crear inscripción
        nueva_inscripcion = PivoteUserCurso(ins.id_user, ins.id_curso)
        session.add(nueva_inscripcion)
        session.commit()

        # Obtener nombre para el mensaje
        nombre = f"{nueva_inscripcion.user.userdetail.firstName} {nueva_inscripcion.user.userdetail.lastName}"
        curso = nueva_inscripcion.curso.name

        return f"{nombre} fue inscripto correctamente al curso {curso}"

    except Exception as e:
        session.rollback()
        print("Error:", e)
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": "Error interno al inscribir alumno"})

    finally:
        session.close()

@user.delete("/users/{user_id}")
def eliminar_usuario(user_id: int, req: Request):
    try:
        # Verificamos el token
        token_data = Security.verify_token(req.headers)
        if token_data.get("status") == "error":
            return JSONResponse(status_code=401, content=token_data)


        user = session.query(User).filter(User.id == user_id, User.active == True).first()
        if not user:
            return JSONResponse(status_code=404, content={"status": "error", "message": "Usuario no encontrado o ya eliminado"})


        # Actualizamos el estado a inactivo (borrado lógico)
        user.active = False


        # Si tenés detalles que también deben ocultarse, hacelo igual:
        user_detail = session.query(UserDetail).filter(UserDetail.user_id == user.id).first()
        if user_detail:
            user_detail.active = False  # Suponiendo que también tiene un campo active


        session.commit()


        return {"status": "success", "message": "Usuario eliminado lógicamente"}


    except Exception as e:
        session.rollback()
        print("Error al eliminar usuario:", e)
        return JSONResponse(status_code=500, content={"status": "error", "message": "Error interno del servidor"})


    finally:
        session.close()




@user.get("/user/career/{_username}")
def get_career_user(_username: str):
    try:
        userEncontrado = session.query(User).filter(User.username == _username ).first()
        arraySalida = []
        if(userEncontrado):
            pivoteusercareer = userEncontrado.pivoteusercareer
            for pivote in pivoteusercareer:
                career_detail = {
                    "usuario": f"{pivote.user.userdetail.firstName} {pivote.user.userdetail.lastName}",
                    "carrera": pivote.career.name,
                }
                arraySalida.append(career_detail)
            return arraySalida
        else:
            return "Usuario no encontrado!"
    except Exception as ex:
        session.rollback()
        print("Error al traer usuario y/o pagos")
    finally:
        session.close()

@user.get("/users/profile/{user_id}")
def get_user_profile(user_id: int):
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        return JSONResponse(status_code=404, content={"status": "error", "message": "Usuario no encontrado"})

    user_detail = session.query(UserDetail).filter(UserDetail.user_id == user.id).first()

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstname": user_detail.firstName,
            "lastname": user_detail.lastName,
            "dni": user_detail.dni,
            "type": user_detail.type
        }
    }


@user.put("/users/profile/{user_id}")
def update_user_profile(user_id: int, profile: UpdateUserProfile):
    try:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return JSONResponse(status_code=404, content={"status": "error", "message": "Usuario no encontrado"})


        user.email = profile.email


        user_detail = session.query(UserDetail).filter(UserDetail.user_id == user.id).first()
        user_detail.firstName = profile.firstname
        user_detail.lastName = profile.lastname
        user_detail.dni = profile.dni


        session.commit()


        return {"status": "success", "message": "Perfil actualizado correctamente"}


    except Exception as ex:
        session.rollback()
        return JSONResponse(status_code=500, content={"status": "error", "message": "Error interno"})


    finally:
        session.close()

@user.put("/users/change-password")
def change_password(req: Request, data: ChangePasswordInput):
    try:
        # Validamos token
        token_data = Security.verify_token(req.headers)

        if token_data.get("status") == "error":
            return JSONResponse(status_code=401, content=token_data)

        user_id = token_data.get("id")
        if not user_id:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Token inválido: sin ID"})

        user = session.query(User).filter(User.id == user_id).first()

        if not user:
            return JSONResponse(status_code=404, content={"status": "error", "message": "Usuario no encontrado"})

        if user.password != data.current_password:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Contraseña actual incorrecta"})

        # Actualiza la contraseña
        user.password = data.new_password
        session.commit()

        return {"status": "success", "message": "Contraseña actualizada correctamente"}

    except Exception as ex:
        session.rollback()
        print(f"Error al cambiar contraseña: {ex}")
        return JSONResponse(status_code=500, content={"status": "error", "message": "Error interno del servidor"})

    finally:
        session.close()
    
@user.get("/user/mis-pagos")
def get_my_payments(req: Request):
    try:
        token_data = Security.verify_token(req.headers)
        if token_data.get("status") == "error":
            return JSONResponse(status_code=401, content=token_data)

        user_id = token_data.get("id")
        user = session.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        pagos = []
        for p in user.payments:
            pagos.append({
                "monto": p.amount,
                "fecha_pago": p.created_at,
                "mes_pagado": p.affected_month,
                "carrera": p.career.name
            })

        return pagos
    except Exception as e:
        session.rollback()
        print("Error al obtener pagos:", e)
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    finally:
        session.close()

@user.get("/user/mis-cursos")
def get_my_courses(req: Request):
    try:
        token_data = Security.verify_token(req.headers)
        if token_data.get("status") == "error":
            return JSONResponse(status_code=401, content=token_data)

        user_id = token_data.get("id")
        user = session.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        cursos = []
        for c in user.cursos:  # Asegurate que haya relación `User.cursos = relationship("Curso", ...)`
            cursos.append({
                "nombre": c.name,
                "estado": c.status,
                "carrera": c.career.name if c.career else None
            })

        return cursos
    except Exception as e:
        session.rollback()
        print("Error al obtener cursos:", e)
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    finally:
        session.close()
    

@user.get("/users/{user_id}/cursos") 
def get_cursos_by_user(user_id: int):
    try:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        cursos = session.query(Curso).filter(Curso.user_id == user_id).all()

        result = []
        for c in cursos:
            result.append({
                "name": c.name,
                "status": c.status
            })

        return JSONResponse(content=result)

    except Exception as e:
        print("Error en get_cursos_by_user:", e)
        session.rollback()
        raise HTTPException(status_code=500, detail="Error interno del servidor")

    finally:
        session.close()

# Endpoint corregido
@user.get("/user/mi-cursada")
def get_mi_cursada(req: Request):
    try:
        # Validar token JWT
        token_data = Security.verify_token(req.headers)
        if token_data.get("status") == "error":
            return JSONResponse(status_code=401, content=token_data)

        user_id = token_data.get("id")
        if not user_id:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Token sin ID de usuario"})

        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return JSONResponse(status_code=404, content={"status": "error", "message": "Usuario no encontrado"})

        # Obtener el curso (año) al que está inscripto el usuario
        curso_inscripto = session.query(PivoteUserCurso).filter_by(id_user=user_id).first()
        if not curso_inscripto:
            return JSONResponse(status_code=404, content={"status": "error", "message": "El usuario no tiene un curso asignado"})

        curso = curso_inscripto.curso

        # Obtener las materias (careers) asignadas a ese curso (año) a través de AsignacionCursoCareer
        materias = []
        for asignacion in curso.asignaciones:
            materia_info = {
                "id": asignacion.career.id,
                "nombre": asignacion.career.name,
                "estado": "Cursando",
                # Puedes agregar más campos si los tienes en tu modelo
                # "profesor": "",
                # "nota": None
            }
            materias.append(materia_info)

        return {
            "curso": {
                "id": curso.id,
                "nombre": curso.name,
                "status": curso.status,
                "anio_escolar": 2025  # O puedes obtenerlo de algún campo específico si lo tienes
            },
            "materias": materias
        }

    except Exception as e:
        session.rollback()
        print("Error al obtener Mi Cursada:", e)
        raise HTTPException(status_code=500, detail="Error interno del servidor")

    finally:
        session.close()
    
    

def validate_username(value):
    existing_user = session.query(User).filter(User.username == value).first()
    session.close()
    if existing_user:
        return None
    else:
        return value


def validate_email(value):
    existing_email = session.query(User).filter(User.email == value).first()
    session.close()
    if existing_email:
        return None
    else:
        return value
    
@user.put("/users/reset-password/{user_id}")
def reset_user_password(user_id: int, req: Request, data: ChangePasswordInput):
    try:
        # Validar token
        token_data = Security.verify_token(req.headers)
        if token_data.get("status") == "error":
            return JSONResponse(status_code=401, content=token_data)


        # Solo permite a administradores
        usuario_admin = session.query(User).filter(User.id == token_data.get("id")).first()
        if not usuario_admin or usuario_admin.userdetail.type != "Administrador":
            return JSONResponse(status_code=403, content={"status": "error", "message": "Acceso denegado"})


        # Buscar usuario objetivo
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return JSONResponse(status_code=404, content={"status": "error", "message": "Usuario no encontrado"})


        # Cambiar la contraseña directamente
        user.password = data.new_password
        session.commit()


        return {"status": "success", "message": "Contraseña restablecida correctamente"}


    except Exception as ex:
        session.rollback()
        print(f"Error al restablecer contraseña: {ex}")
        return JSONResponse(status_code=500, content={"status": "error", "message": "Error interno del servidor"})


    finally:
        session.close()
