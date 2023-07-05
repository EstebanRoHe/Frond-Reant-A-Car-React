import React, { useState, useEffect } from "react";
import rentServices from "../services/rentServices";
import Loading from "./Loading"
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import AuthServices from '../services/authServices';
import Paginate from './Paginate';

const RentList = () => {
    const [Rent, setRent] = useState([]);
    let navigate = useNavigate;
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;
    const [filtro, setFiltro] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        getList();
    }, []);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const paginated = Rent.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handleFiltroChange = (event) => {
        setFiltro(event.target.value);
        filtroUsername();
    };

    const getList = () => {
        const token = AuthServices.getAuthToken();
        if (token) {
            rentServices.setAuthToken(token);
        } else {
            return;
        }
        rentServices.getAll()
            .then(response => {
                if (filtro) {
                    const filteredRent = response.data.filter((Rent) =>
                        Rent.username.toLowerCase().includes(filtro.toLowerCase())
                    );
                    setRent(filteredRent);
                } else {
                    setRent(response.data);
                }
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });

    };

    const filtroUsername = () => {
        const token = AuthServices.getAuthToken();
        if (token) {
            rentServices.setAuthToken(token);
        } else {
            return;
        }
        if (filtro != null) {
            rentServices.getFiltro(filtro)
                .then((response) => {
                    setRent(response.data);
                    setError(false);
                    console.log(response.data);
                })
                .catch((e) => {
                    setError(true);
                    console.log(e);
                });
        } else {
            getList()
        }
    };

    const remove = (idRent) => {
        const token = AuthServices.getAuthToken();
        if (token) {
            rentServices.setAuthToken(token);
        } else {
            console.error("No se encontró un token válido");
            return;
        }
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

        swalWithBootstrapButtons.fire({
            title: 'Deseas eliminar este archivo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, eliminar!',
            cancelButtonText: 'No, cancelar!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                rentServices.remove(idRent)
                    .then(response => {
                        console.log(response.data);
                        swalWithBootstrapButtons.fire(

                            'Eliminado!',
                            'Tu archivo ha sido eliminado',
                            'Correctamente'
                        )
                       // navigate(getList());
                    }).then(() => {
                        getList();
                    })
                    .catch(error => {
                        swalWithBootstrapButtons.fire(
                            'Error',
                            'Error al eliminar este archivo',
                            'error'
                        );
                    });

            } else if (

                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire(
                    'Cancelado',
                    'No se ha eliminado nungun archivo'
                )
            }
        })
    };

    return (

        <div className="container ">
            {Rent.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Loading />
                    <Link className="btn btn-primary" to={"/RentCreate/"+null}>
                        <i className="bi bi-card-checklist"> Rentar un Vehiculo</i>
                    </Link>

                </div>
            ) : (

                <div className="card text bg-light mb-3">

                    <div className="card-header d-flex justify-content-between">
                        <Link className="btn btn-primary" style={{ height: "5vh" }} to={"/RentCreate/"+null}>
                            <i className="bi bi-card-checklist"> Rentar un Vehiculo</i>
                        </Link>
                        <div className="ml-auto d-flex flex-column">
                            <div className="input-container">
                                <input
                                    type="text"
                                    className="form-control filtro flex-grow-1 "
                                    value={filtro}
                                    onChange={handleFiltroChange}
                                    onBlur={handleFiltroChange}
                                    onKeyUp={handleFiltroChange}
                                    placeholder="Seach for Username"
                                   
                                />
                            </div>
                            {error && (
                                <small className="errorSmall" id="helpId" style={{marginTop:"1%"}} >
                                    <i className="bi bi-exclamation-circle"> Usuario no encontrado</i>
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="card-body ">
                        <div className="table-responsive">
                            <table className="table table-striped border = 1">
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Usuario</th>
                                        <th scope="col">Vehiculo</th>
                                        <th scope="col">Fecha</th>

                                    </tr>

                                </thead>
                                <tbody>

                                    {Rent
                                        && paginated.map(
                                            (rent) => (
                                                <tr key={rent.idRent}>
                                                    <th scope="row">{rent.idRent}</th>
                                                    <td>{rent.username.username}</td>
                                                    <td>{rent.car.licencePlate}</td>
                                                    <td>{rent.dateRent}</td>

                                                    <td>
                                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                                            <Link className="btn btn-secondary" to={"/RentUpdate/" + rent.idRent}>
                                                                <i className="bi bi-gear"> Actualizar</i>
                                                            </Link>

                                                            <button className="btn btn-danger" onClick={() => remove(rent.idRent)}>
                                                                <i className="bi bi-trash3"> Eliminar</i>
                                                            </button>
                                                        </div>

                                                    </td>
                                                </tr>

                                            ))}
                                </tbody>

                            </table>
                            <Paginate
                                pageCount={Math.ceil(Rent.length / itemsPerPage)}
                                handlePageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>


    );
};

export default RentList;


