import Swal from 'sweetalert2';
import type { SweetAlertIcon } from 'sweetalert2';

export const toast = (icon: SweetAlertIcon, title: string) => {
  Swal.fire({ icon, title, toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, timerProgressBar: true });
};

export const showSuccess = (title: string) => {
  Swal.fire({ icon: 'success', title, timer: 2000, showConfirmButton: false });
};

export const showError = (msg: string) => {
  Swal.fire({ icon: 'error', title: 'Erreur', text: msg, confirmButtonColor: '#0A192F' });
};

export default Swal;