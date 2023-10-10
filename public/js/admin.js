window.deleteProduct = async (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElem = btn.closest('article');

    const res = await fetch(`/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'csrf-token': csrf },
    });

    if (!res.ok) {
        console.error('Something went wrong');
        return;
    }

    productElem.remove();
};
