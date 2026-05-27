from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import UserProfile

class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=True, label="Full Name")
    email = forms.EmailField(required=True, label="Email Address")
    role = forms.ChoiceField(
        choices=[('creator', 'Creator (Individual)'), ('brand', 'Brand or Agency')],
        widget=forms.Select(),
        required=True,
        label="Account Type"
    )
    instagram_handle = forms.CharField(
        max_length=100,
        required=False,
        label="Instagram Handle",
        help_text="Optional - e.g., @username"
    )
    company_name = forms.CharField(
        max_length=100,
        required=False,
        label="Company / Brand Name",
        help_text="Optional - for brands and agencies"
    )

    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('first_name', 'email')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data['first_name']
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.role = self.cleaned_data['role']
            profile.instagram_handle = self.cleaned_data['instagram_handle']
            profile.company_name = self.cleaned_data['company_name']
            profile.save()
        return user
