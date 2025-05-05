import { useState } from "react";
import { UserTable } from "./userTable.tsx";
import { UserForm } from "../components/userForm.tsx";
import { UserDetail } from "../components/userDetail.tsx";
import { Plus } from 'lucide-react';
import type { User } from "../types/user.ts";
import Swal from 'sweetalert2';
import { Button } from "@/shared/components/ui/button.tsx";

export function UserManagement() {
    const [view, setView] = useState<"table" | "form" | "detail">("table");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([
        {
            id: "1",
            tipoDocumento: "CC",
            numeroDocumento: "1234567890",
            nombre: "Juan",
            apellido: "Pérez",
            correo: "juan.perez@ejemplo.com",
            genero: "Masculino",
            telefono: "3001234567",
            direccion: "Calle 123 # 45-67",
            fechaNacimiento: "1990-01-01",
            estado: true,
            fechaRegistro: "2023-01-01T00:00:00.000Z",
        },
        {
            id: "2",
            tipoDocumento: "CE",
            numeroDocumento: "0987654321",
            nombre: "María",
            apellido: "González",
            correo: "maria.gonzalez@ejemplo.com",
            genero: "Femenino",
            telefono: "3109876543",
            direccion: "Avenida 789 # 12-34",
            fechaNacimiento: "1985-05-15",
            estado: true,
            fechaRegistro: "2023-02-15T00:00:00.000Z",
        },
        {
            id: "3",
            tipoDocumento: "TI",
            numeroDocumento: "1122334455",
            nombre: "Carlos",
            apellido: "Rodríguez",
            correo: "carlos.rodriguez@ejemplo.com",
            genero: "Masculino",
            telefono: "3201234567",
            estado: false,
            fechaRegistro: "2023-03-10T00:00:00.000Z",
        },
        {
            id: "4",
            tipoDocumento: "CC",
            numeroDocumento: "1000763947",
            nombre: "Laura",
            apellido: "García Ángel",
            correo: "laura.angel@ejemplo.com",
            genero: "Femenino",
            telefono: "3131234567",
            estado: false,
            fechaRegistro: "2023-03-10T00:00:00.000Z",
        },
        {
            id: "5",
            tipoDocumento: "CC",
            numeroDocumento: "1001234567",
            nombre: "Yeferson",
            apellido: "Acero Jaramillo",
            correo: "fearson@ejemplo.com",
            genero: "Masculino",
            telefono: "3251234567",
            estado: false,
            fechaRegistro: "2023-03-10T00:00:00.000Z",
        },
        {
            id: "6",
            tipoDocumento: "CC",
            numeroDocumento: "1231234567",
            nombre: "Alejandro",
            apellido: "Villada Jaramillo",
            correo: "AlViJaja@ejemplo.com",
            genero: "Otro",
            telefono: "3011234567",
            estado: false,
            fechaRegistro: "2023-03-10T00:00:00.000Z",
        },
        {
            id: "7",
            tipoDocumento: "CC",
            numeroDocumento: "2000112233",
            nombre: "Adriana",
            apellido: "Mendoza Cruz",
            correo: "adriana.mendoza@ejemplo.com",
            genero: "Femenino",
            telefono: "3151122334",
            direccion: "Carrera 8 # 12-45",
            fechaNacimiento: "1992-07-22",
            estado: true,
            fechaRegistro: "2023-04-05T00:00:00.000Z",
        },
        {
            id: "8",
            tipoDocumento: "CE",
            numeroDocumento: "XK12345678",
            nombre: "Andrés",
            apellido: "Silva Rojas",
            correo: "andres.silva@ejemplo.com",
            genero: "Masculino",
            telefono: "3204455667",
            fechaNacimiento: "1988-11-30",
            estado: true,
            fechaRegistro: "2023-04-10T00:00:00.000Z",
        },
        {
            id: "9",
            tipoDocumento: "CC",
            numeroDocumento: "5432167890",
            nombre: "Camila",
            apellido: "Torres García",
            correo: "camila.torres@ejemplo.com",
            genero: "Femenino",
            telefono: "3178899001",
            direccion: "Avenida 68 # 53-21",
            fechaNacimiento: "1995-05-18",
            estado: false,
            fechaRegistro: "2023-05-01T00:00:00.000Z",
        },
        {
            id: "10",
            tipoDocumento: "TI",
            numeroDocumento: "9876543219",
            nombre: "Daniel",
            apellido: "Vargas Pérez",
            correo: "daniel.vargas@ejemplo.com",
            genero: "Masculino",
            telefono: "3134456789",
            fechaNacimiento: "2002-09-14",
            estado: true,
            fechaRegistro: "2023-05-15T00:00:00.000Z",
        },
        {
            id: "11",
            tipoDocumento: "CC",
            numeroDocumento: "1122334456",
            nombre: "David",
            apellido: "Jiménez Soto",
            correo: "david.jimenez@ejemplo.com",
            genero: "Masculino",
            telefono: "3189900112",
            direccion: "Calle 100 # 11B-25",
            fechaNacimiento: "1998-03-03",
            estado: false,
            fechaRegistro: "2023-06-01T00:00:00.000Z",
        },
        {
            id: "12",
            tipoDocumento: "CC",
            numeroDocumento: "6655443322",
            nombre: "Diana",
            apellido: "Ramírez López",
            correo: "diana.ramirez@ejemplo.com",
            genero: "Femenino",
            telefono: "3145566778",
            fechaNacimiento: "1993-12-25",
            estado: true,
            fechaRegistro: "2023-06-20T00:00:00.000Z",
        },
        {
            id: "13",
            tipoDocumento: "CE",
            numeroDocumento: "AA98765432",
            nombre: "Diego",
            apellido: "Herrera Castro",
            correo: "diego.herrera@ejemplo.com",
            genero: "Masculino",
            telefono: "3190011223",
            direccion: "Transversal 23 # 45-67",
            fechaNacimiento: "1987-08-17",
            estado: false,
            fechaRegistro: "2023-07-05T00:00:00.000Z",
        },
        {
            id: "14",
            tipoDocumento: "CC",
            numeroDocumento: "3344556677",
            nombre: "Elena",
            apellido: "Gómez Sánchez",
            correo: "elena.gomez@ejemplo.com",
            genero: "Femenino",
            telefono: "3123344556",
            fechaNacimiento: "1991-04-12",
            estado: true,
            fechaRegistro: "2023-07-18T00:00:00.000Z",
        },
        {
            id: "15",
            tipoDocumento: "TI",
            numeroDocumento: "1239876543",
            nombre: "Felipe",
            apellido: "Díaz Romero",
            correo: "felipe.diaz@ejemplo.com",
            genero: "Masculino",
            telefono: "3217788990",
            direccion: "Carrera 19 # 88-50",
            fechaNacimiento: "2005-02-28",
            estado: false,
            fechaRegistro: "2023-08-01T00:00:00.000Z",
        },
        {
            id: "16",
            tipoDocumento: "CC",
            numeroDocumento: "7890123456",
            nombre: "Fernanda",
            apellido: "Castillo Morales",
            correo: "fernanda.castillo@ejemplo.com",
            genero: "Femenino",
            telefono: "3156677889",
            fechaNacimiento: "1994-06-09",
            estado: true,
            fechaRegistro: "2023-08-15T00:00:00.000Z",
        },
        {
            id: "17",
            tipoDocumento: "CC",
            numeroDocumento: "2233445566",
            nombre: "Gabriel",
            apellido: "Ríos Mendoza",
            correo: "gabriel.rios@ejemplo.com",
            genero: "Masculino",
            telefono: "3178899002",
            direccion: "Avenida 26 # 62-33",
            fechaNacimiento: "1989-10-11",
            estado: false,
            fechaRegistro: "2023-09-01T00:00:00.000Z",
        },
        {
            id: "18",
            tipoDocumento: "CE",
            numeroDocumento: "BC23456789",
            nombre: "Isabel",
            apellido: "Santos Navarro",
            correo: "isabel.santos@ejemplo.com",
            genero: "Femenino",
            telefono: "3200099887",
            fechaNacimiento: "1997-01-07",
            estado: true,
            fechaRegistro: "2023-09-20T00:00:00.000Z",
        },
        {
            id: "19",
            tipoDocumento: "CC",
            numeroDocumento: "4455667788",
            nombre: "Javier",
            apellido: "Ortega Guzmán",
            correo: "javier.ortega@ejemplo.com",
            genero: "Masculino",
            telefono: "3141122334",
            direccion: "Calle 72 # 13-45",
            fechaNacimiento: "1996-07-19",
            estado: false,
            fechaRegistro: "2023-10-05T00:00:00.000Z",
        },
        {
            id: "20",
            tipoDocumento: "CC",
            numeroDocumento: "9988776655",
            nombre: "Jimena",
            apellido: "Vega Rincón",
            correo: "jimena.vega@ejemplo.com",
            genero: "Femenino",
            telefono: "3182233445",
            fechaNacimiento: "2000-08-03",
            estado: true,
            fechaRegistro: "2023-10-18T00:00:00.000Z",
        },
        {
            id: "21",
            tipoDocumento: "TI",
            numeroDocumento: "1357924680",
            nombre: "José",
            apellido: "Cordoba Álvarez",
            correo: "jose.cordoba@ejemplo.com",
            genero: "Masculino",
            telefono: "3135544667",
            direccion: "Carrera 15 # 22-18",
            fechaNacimiento: "2004-12-14",
            estado: false,
            fechaRegistro: "2023-11-01T00:00:00.000Z",
        },
        {
            id: "22",
            tipoDocumento: "CC",
            numeroDocumento: "2468013579",
            nombre: "Lucía",
            apellido: "Paredes Franco",
            correo: "lucia.paredes@ejemplo.com",
            genero: "Femenino",
            telefono: "3196677889",
            fechaNacimiento: "1999-04-22",
            estado: true,
            fechaRegistro: "2023-11-15T00:00:00.000Z",
        },
        {
            id: "23",
            tipoDocumento: "CE",
            numeroDocumento: "CD34567890",
            nombre: "Mateo",
            apellido: "Cifuentes Rojas",
            correo: "mateo.cifuentes@ejemplo.com",
            genero: "Masculino",
            telefono: "3208899001",
            direccion: "Avenida 30 # 45-10",
            fechaNacimiento: "1990-03-17",
            estado: false,
            fechaRegistro: "2023-12-01T00:00:00.000Z",
        },
        {
            id: "24",
            tipoDocumento: "CC",
            numeroDocumento: "1029384756",
            nombre: "Natalia",
            apellido: "Giraldo Mesa",
            correo: "natalia.giraldo@ejemplo.com",
            genero: "Femenino",
            telefono: "3173344556",
            fechaNacimiento: "1995-09-08",
            estado: true,
            fechaRegistro: "2023-12-15T00:00:00.000Z",
        },
        {
            id: "25",
            tipoDocumento: "CC",
            numeroDocumento: "0192837465",
            nombre: "Óscar",
            apellido: "Zapata Gil",
            correo: "oscar.zapata@ejemplo.com",
            genero: "Masculino",
            telefono: "3157788990",
            direccion: "Calle 85 # 9-73",
            fechaNacimiento: "1986-06-25",
            estado: false,
            fechaRegistro: "2023-12-20T00:00:00.000Z",
        },
        {
            id: "26",
            tipoDocumento: "TI",
            numeroDocumento: "7531598462",
            nombre: "Paula",
            apellido: "Restrepo Arango",
            correo: "paula.restrepo@ejemplo.com",
            genero: "Femenino",
            telefono: "3169922334",
            fechaNacimiento: "2003-10-31",
            estado: true,
            fechaRegistro: "2023-12-31T00:00:00.000Z",
        }
    ]);

    const handleAddUser = () => {
        setSelectedUser(null);
        setView("form");
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setView("form");
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setView("detail");
    };

    const handleSaveUser = (user: User) => {
        if (selectedUser) {
            // Editar usuario existente
            setUsers(users.map((u) => (u.id === user.id ? user : u)));
        } else {
            // Agregar nuevo usuario
            setUsers([...users, { ...user, id: Date.now().toString(), fechaRegistro: new Date().toISOString() }]);
        }
        setView("table");
    };

    const handleToggleUserStatus = (userId: string) => {
        setUsers(users.map((user) => (user.id === userId ? { ...user, estado: !user.estado } : user)));
    };

    const handleBackToTable = () => {
        if (view === "form") {
            Swal.fire({
                title: '¿Salir sin guardar?',
                text: 'Los cambios no guardados se perderán.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#000',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    setView("table");
                }
            });
        } else {
            setView("table");
        }
    };

    return (
        <div className="space-y-6 p-6 ">
            {view === "table" && (
                <>
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-semibold"></div>
                        <Button
                            onClick={handleAddUser}
                            className="bg-black hover:bg-[#1F2937] text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo Usuario
                        </Button>
                    </div>
                    <UserTable
                        users={users}
                        onEdit={handleEditUser}
                        onView={handleViewUser}
                        onToggleStatus={handleToggleUserStatus}
                    />
                </>
            )}

            {view === "form" && (
                <UserForm user={selectedUser} onSave={handleSaveUser} onCancel={handleBackToTable} existingUsers={users} />
            )}

            {view === "detail" && selectedUser && (
                <UserDetail user={selectedUser} onBack={handleBackToTable} onEdit={() => handleEditUser(selectedUser)} />
            )}
        </div>
    );
}
