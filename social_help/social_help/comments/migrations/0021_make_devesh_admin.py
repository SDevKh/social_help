from django.db import migrations

def make_devesh_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    
    # Update by email (find all matching since email is not unique by default)
    users_by_email = User.objects.filter(email='deveshkh141@gmail.com')
    if users_by_email.exists():
        for user in users_by_email:
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"Updated user ID {user.id} (email: deveshkh141@gmail.com) to staff and superuser.")
    
    # Also search by username
    users_by_username = User.objects.filter(username='deveshkh141@gmail.com')
    if users_by_username.exists():
        for user in users_by_username:
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"Updated user ID {user.id} (username: deveshkh141@gmail.com) to staff and superuser.")

class Migration(migrations.Migration):

    dependencies = [
        ('comments', '0020_blogpost'),
    ]

    operations = [
        migrations.RunPython(make_devesh_admin),
    ]
