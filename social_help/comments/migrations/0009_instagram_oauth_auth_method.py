from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comments', '0008_add_direct_instagram_auth'),
    ]

    operations = [
        migrations.AlterField(
            model_name='instagramaccount',
            name='auth_method',
            field=models.CharField(choices=[('instagram_oauth', 'Instagram OAuth'), ('facebook_oauth', 'Facebook OAuth'), ('direct_token', 'Direct Token')], default='instagram_oauth', max_length=20),
        ),
    ]
