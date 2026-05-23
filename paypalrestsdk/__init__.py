"""A minimal stub implementation of the PayPal REST SDK for development purposes.
This provides the subset of classes and methods used in the project:
- configure(settings): no‑op function to store configuration.
- Payment: class with constructor storing provided data, a create() method that
  simulates a successful payment creation by populating a dummy approval URL,
  and static methods find() and execute() used by the PayPalExecute view.
The implementation is intentionally simple and does not perform any network
calls. It allows the Django app to run without installing the real
paypalrestsdk, which is not currently available for Python 3.13.
"""

import uuid

# Global variable to hold configuration (mode, client_id, client_secret)
_config = {}


def configure(settings_dict):
    """Store SDK configuration.
    The real SDK would validate and store credentials; here we simply keep
    them in a module‑level dictionary.
    """
    global _config
    _config = settings_dict


class _Link:
    def __init__(self, rel, href):
        self.rel = rel
        self.href = href


class Payment:
    """A very small mock of paypalrestsdk.Payment.
    It supports ``create`` (returns True), ``links`` (provides an approval URL),
    ``error`` attribute, ``find`` class method, and ``execute`` method.
    """

    # Store created payments in a simple dict keyed by payment ID
    _registry = {}

    def __init__(self, **kwargs):
        self.kwargs = kwargs
        # Generate a pseudo‑random payment ID
        self.id = str(uuid.uuid4())
        self.error = None
        # Populate placeholder links; the real SDK returns a list of objects
        self.links = []

    def create(self):
        """Simulate a successful payment creation.
        The dummy implementation always succeeds and adds an ``approval_url``
        link that points to a local placeholder.
        """
        # In a real scenario, errors could be set; here we always succeed.
        approval_url = f"http://localhost:8000/paypal/execute/?paymentId={self.id}&PayerID=TESTPAYER"
        self.links = [_Link(rel="approval_url", href=approval_url)]
        # Register the payment so ``find`` can retrieve it later.
        Payment._registry[self.id] = self
        return True

    @classmethod
    def find(cls, payment_id):
        """Retrieve a previously created mock payment.
        If the payment does not exist, return a new instance with ``error`` set.
        """
        payment = cls._registry.get(payment_id)
        if payment is None:
            # Return a dummy object that will fail execution.
            dummy = cls()
            dummy.id = payment_id
            dummy.error = {"message": "Payment not found in mock SDK"}
            return dummy
        return payment

    def execute(self, payer_info):
        """Simulate execution of a payment.
        ``payer_info`` should contain a ``payer_id`` key. The mock simply
        returns ``True`` to indicate success.
        """
        # In a real SDK, validation would occur here. We assume success.
        return True

    # The real SDK also provides a ``__repr__`` for debugging; optional.
    def __repr__(self):
        return f"<MockPayment id={self.id}>"
